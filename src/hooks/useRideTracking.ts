import openStreetMapService, { LocationCoords } from '@/services/openStreetMapService';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import { realtimeService } from '../services/realtimeService';
import { supabase } from '../services/supabaseClient';

export interface RideTrackingData {
  origin: LocationCoords;
  destination: LocationCoords;
  driverLocation?: LocationCoords;
  userLocation?: LocationCoords;
  eta: string;
  etaType: 'driver_to_user' | 'driver_to_destination' | 'user_waiting_driver';
  distance: string;
  duration: string;
  routeCoordinates: LocationCoords[];
  status: 'searching' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
}

export interface UseRideTrackingOptions {
  rideId: string;
  userId?: string;
  driverId?: string;
  isDriver?: boolean;
  updateInterval?: number;
}

export const useRideTracking = ({
  rideId,
  userId,
  driverId,
  isDriver = false,
  updateInterval = 30000
}: UseRideTrackingOptions) => {
  const [trackingData, setTrackingData] = useState<RideTrackingData | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationCoords | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const rideSubscription = useRef<any>(null);

  // Obtener ubicación actual y configurar tracking
  useEffect(() => {
    let isMounted = true;

    const setupLocationTracking = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setError('Permiso de ubicación denegado');
          return;
        }

        // Obtener ubicación inicial con mayor precisión
        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const currentCoords = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        console.log('[useRideTracking] Ubicación inicial obtenida:', currentCoords);

        if (isMounted) {
          setCurrentLocation(currentCoords);
        }

        // Configurar tracking continuo con intervalo mucho más largo
        locationSubscription.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: Math.max(updateInterval, 300000), // Mínimo 300 segundos (5 minutos)
            distanceInterval: 1000, // Solo actualizar si se mueve más de 1 kilómetro
          },
          (newLocation) => {
            const newCoords = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            };

            if (isMounted) {
              // console.log('[useRideTracking] Nueva ubicación detectada:', newCoords);
              setCurrentLocation(newCoords);
            }

            // Actualizar ubicación en Supabase con debounce mucho más largo
            if (isDriver && driverId) {
              // Usar debounce para evitar actualizaciones frecuentes
              const now = Date.now();
              const lastUpdate = (realtimeService as any).lastLocationUpdate || 0;
              
              if (now - lastUpdate > 300000) { // Solo actualizar cada 5 minutos
                (realtimeService as any).lastLocationUpdate = now;
                realtimeService.updateDriverLocation(driverId, newCoords).catch((error: any) => {
                  console.error('Error al actualizar ubicación del conductor:', error);
                });
              }
            } else if (!isDriver && userId) {
              // Para usuarios, podríamos actualizar en la tabla users o crear una tabla separada
              const now = Date.now();
              const lastUpdate = (supabase as any).lastLocationUpdate || 0;
              
              if (now - lastUpdate > 300000) { // Solo actualizar cada 5 minutos
                (supabase as any).lastLocationUpdate = now;
                (async () => {
                  try {
                    await supabase
                      .from('users')
                      .update({
                        location: newCoords,
                        updated_at: new Date().toISOString()
                      })
                      .eq('id', userId);
                  } catch (error: any) {
                    console.error('Error al actualizar ubicación del usuario:', error);
                  }
                })();
              }
            }
          }
        );
      } catch (error) {
        console.error('Error al configurar tracking de ubicación:', error);
        if (isMounted) {
          setError('Error al obtener ubicación');
        }
      }
    };

    setupLocationTracking();

    return () => {
      isMounted = false;
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [driverId, userId, isDriver, updateInterval]);

  // Escuchar cambios en el viaje
  useEffect(() => {
    // Suscribirse a cambios en el viaje
    if (!rideId) return;

    rideSubscription.current = supabase
      .channel(`ride_${rideId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ride_requests',
          filter: `id=eq.${rideId}`
        },
        (payload: any) => {
          const old = payload.old;
          const newData = payload.new;

          if (newData && newData.id === rideId) {
            const data = newData;
            if (!data) return;

            const originCoords = data.origin?.coordinates;
            const destCoords = data.destination?.coordinates;
            const driverCoords = data.driverLocation || data.driver?.location;
            const userCoords = data.userLocation || data.user?.location;

            if (originCoords && destCoords) {
              setTrackingData({
                origin: originCoords,
                destination: destCoords,
                driverLocation: driverCoords,
                userLocation: userCoords,
                eta: data.eta || '',
                etaType: data.etaType || 'driver_to_user',
                distance: data.distance || '',
                duration: data.duration || '',
                routeCoordinates: data.routeCoordinates || [],
                status: data.status || 'searching'
              });
            }

            setIsLoading(false);
          }
        }
      )
      .subscribe();

    return () => {
      if (rideSubscription.current) {
        supabase.removeChannel(rideSubscription.current);
      }
    };
  }, [rideId]);

  // Actualizar ETA automáticamente cada 120 segundos (reducido aún más)
  useEffect(() => {
    if (!trackingData || !currentLocation) {
      console.log('[useRideTracking] No se puede actualizar ETA:', { 
        hasTrackingData: !!trackingData, 
        hasCurrentLocation: !!currentLocation 
      });
      return;
    }

    // Actualizar ETA más frecuentemente para viajes en progreso
    const lastETAUpdate = (useRideTracking as any).lastETAUpdate || 0;
    const now = Date.now();
    
    // Permitir actualización más frecuente si el viaje está en progreso
    const updateInterval = trackingData.status === 'in_progress' ? 60000 : 300000; // 1 min vs 5 min
    
    if (now - lastETAUpdate < updateInterval) {
      return;
    }

    const updateETA = async () => {
      try {
        let fromCoords: LocationCoords;
        let toCoords: LocationCoords;
        let etaType: 'driver_to_user' | 'driver_to_destination' | 'user_waiting_driver';
        let etaDescription: string;

        if (isDriver) {
          if (trackingData.status === 'accepted') {
            // Conductor: ubicación actual -> origen del viaje (donde está el usuario)
            fromCoords = currentLocation;
            toCoords = trackingData.origin;
            etaType = 'driver_to_user';
            etaDescription = 'Tiempo para llegar al usuario';
            console.log('[useRideTracking] Calculando ETA para conductor hacia usuario:', { fromCoords, toCoords });
          } else if (trackingData.status === 'in_progress') {
            // Conductor: ubicación actual -> destino del viaje
            fromCoords = currentLocation;
            toCoords = trackingData.destination;
            etaType = 'driver_to_destination';
            etaDescription = 'Tiempo para llegar al destino';
            console.log('[useRideTracking] Calculando ETA para conductor hacia destino:', { fromCoords, toCoords });
          } else {
            return; // No calcular ETA en otros estados
          }
        } else {
          // Usuario
          if (trackingData.status === 'accepted' && trackingData.driverLocation) {
            // Usuario esperando: ubicación del conductor -> origen del viaje
            fromCoords = trackingData.driverLocation;
            toCoords = trackingData.origin;
            etaType = 'user_waiting_driver';
            etaDescription = 'Tiempo de llegada del conductor';
            console.log('[useRideTracking] Calculando ETA para usuario esperando conductor:', { fromCoords, toCoords });
          } else if (trackingData.status === 'in_progress') {
            // Usuario en viaje: ubicación actual -> destino
            fromCoords = currentLocation;
            toCoords = trackingData.destination;
            etaType = 'driver_to_destination';
            etaDescription = 'Tiempo para llegar al destino';
            console.log('[useRideTracking] Calculando ETA para usuario hacia destino:', { fromCoords, toCoords });
          } else {
            return; // No calcular ETA en otros estados
          }
        }

        const eta = await calculateETA(fromCoords, toCoords);
        console.log('[useRideTracking] ETA calculado:', eta, 'Tipo:', etaType);
        
        // Actualizar ETA en Supabase solo si es diferente al anterior
        const rideRef = supabase
          .from('ride_requests')
          .update({
            eta: eta,
            etaType: etaType,
            etaDescription: etaDescription,
            updated_at: new Date().toISOString()
          })
          .eq('id', rideId);

        console.log('[useRideTracking] ETA actualizado en Supabase:', eta, 'Tipo:', etaType);
        (useRideTracking as any).lastETAUpdate = now;
      } catch (error) {
        console.error('[useRideTracking] Error al actualizar ETA:', error);
      }
    };

    // Configurar actualización periódica más frecuente
    const interval = setInterval(updateETA, updateInterval);

    return () => clearInterval(interval);
  }, [trackingData, currentLocation, isDriver, rideId]);

  // Calcular ETA en tiempo real
  const calculateETA = async (from: LocationCoords, to: LocationCoords): Promise<string> => {
    try {
      console.log('[useRideTracking] Iniciando cálculo de ETA:', { from, to });
      
      const route = await openStreetMapService.getRoute(from, to, 'driving');
      if (route) {
        const etaMinutes = Math.round(route.totalDuration / 60);
        const eta = `${etaMinutes} min`;
        console.log('[useRideTracking] ETA calculado exitosamente:', eta);
        return eta;
      } else {
        console.log('[useRideTracking] No se pudo calcular la ruta');
        return 'Calculando...';
      }
    } catch (error) {
      console.error('[useRideTracking] Error al calcular ETA:', error);
      return 'Calculando...';
    }
  };

  return {
    trackingData,
    currentLocation,
    isLoading,
    error,
    calculateETA
  };
}; 