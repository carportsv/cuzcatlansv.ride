import openStreetMapService, { LocationCoords } from '@/services/openStreetMapService';
import { useEffect, useRef, useState } from 'react';

export interface RouteData {
  distance: number;
  duration: number;
  geometry: {
    coordinates: Array<[number, number]>;
  };
}

export interface UseRouteDirectionsOptions {
  origin: LocationCoords;
  destination: LocationCoords;
  waypoints?: LocationCoords[];
  mode?: 'driving' | 'walking' | 'cycling';
  avoid?: string;
  units?: 'metric' | 'imperial';
}

export const useRouteDirections = ({
  origin,
  destination,
  waypoints = [],
  mode = 'driving',
  avoid,
  units = 'metric'
}: UseRouteDirectionsOptions) => {
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usar useRef para almacenar las últimas coordenadas y evitar re-renders
  const lastCoordsRef = useRef<{
    originLat: number;
    originLng: number;
    destLat: number;
    destLng: number;
    lastUpdate: number;
  } | null>(null);

  const fetchRoute = async () => {
    if (!origin.latitude || !destination.latitude) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await openStreetMapService.getRoute(origin, destination, mode, waypoints);
      
      if (result) {
        const routeDataToSet = {
          distance: result.totalDistance,
          duration: result.totalDuration,
          geometry: {
            coordinates: result.points.map((point: any) => [point.longitude, point.latitude] as [number, number])
          }
        };
        console.log('[useRouteDirections] Ruta calculada exitosamente:', {
          totalDistance: result.totalDistance,
          totalDuration: result.totalDuration,
          coordinatesCount: result.points.length
        });
        setRouteData(routeDataToSet);
      } else {
        setError('No se encontró una ruta');
      }
    } catch (error) {
      console.error('Error al obtener direcciones:', error);
      setError('Error al obtener la ruta');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Solo calcular ruta si las coordenadas son válidas y no son (0,0)
    if (!origin.latitude || !destination.latitude || 
        origin.latitude === 0 || origin.longitude === 0 ||
        destination.latitude === 0 || destination.longitude === 0) {
      console.log('[useRouteDirections] Coordenadas inválidas, no calculando ruta:', { origin, destination });
      return;
    }
    
    const now = Date.now();
    const lastCoords = lastCoordsRef.current;
    
    // Verificar si han pasado al menos 5 segundos desde la última actualización (reducido para evitar líneas diagonales)
    if (lastCoords && (now - lastCoords.lastUpdate) < 5000) {
      console.log('[useRouteDirections] Evitando actualización - muy reciente (menos de 5 segundos)');
      return;
    }
    
    // Solo actualizar si las coordenadas han cambiado significativamente (reducido a 0.001 grados = ~100m)
    const shouldUpdate = !lastCoords || 
      Math.abs(origin.latitude - lastCoords.originLat) > 0.001 || // Reducido a 0.001 grados (~100m)
      Math.abs(origin.longitude - lastCoords.originLng) > 0.001 ||
      Math.abs(destination.latitude - lastCoords.destLat) > 0.001 ||
      Math.abs(destination.longitude - lastCoords.destLng) > 0.001;
    
    if (shouldUpdate) {
      console.log('[useRouteDirections] Calculando nueva ruta - coordenadas cambiaron significativamente (>11km)');
      
      // Actualizar las coordenadas almacenadas
      lastCoordsRef.current = {
        originLat: origin.latitude,
        originLng: origin.longitude,
        destLat: destination.latitude,
        destLng: destination.longitude,
        lastUpdate: now
      };
      
      fetchRoute();
    } else {
      console.log('[useRouteDirections] Evitando actualización - coordenadas similares');
    }
  }, [origin.latitude, origin.longitude, destination.latitude, destination.longitude, mode]);

  const getRouteCoordinates = () => {
    const coords = routeData?.geometry?.coordinates || [];
    console.log('[useRouteDirections] getRouteCoordinates llamado, devolviendo:', coords.length, 'coordenadas');
    return coords;
  };

  return {
    routeData,
    isLoading,
    error,
    refetch: fetchRoute,
    getRouteCoordinates
  };
}; 