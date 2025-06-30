import { app } from '@/services/firebaseConfig';
import { RideData } from '@/services/rideService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { collection, doc, getFirestore, onSnapshot, query, updateDoc, where } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const DriverRideScreen = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const [ride, setRide] = useState<RideData | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [driverLocation, setDriverLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [etaToUser, setEtaToUser] = useState<number | null>(null);
  const [tripDuration, setTripDuration] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCheckedForRide, setHasCheckedForRide] = useState(false);

  useEffect(() => {
    const loadDriverId = async () => {
      const storedDriverId = await AsyncStorage.getItem('userUID');
      setDriverId(storedDriverId);
    };
    loadDriverId();
  }, []);

  // Obtener ubicación en tiempo real del conductor
  useEffect(() => {
    let locationSubscription: Location.LocationSubscription | null = null;

    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        const currentLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };

        setDriverLocation(currentLocation);

        // Actualizar ubicación en Firestore
        if (driverId) {
          const db = getFirestore(app);
          const driverRef = doc(db, 'drivers', driverId);
          await updateDoc(driverRef, {
            location: currentLocation,
            updatedAt: new Date().toISOString()
          });
        }

        // Configurar seguimiento de ubicación
        locationSubscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.Balanced,
            timeInterval: 30000, // Actualizar cada 30 segundos
            distanceInterval: 50, // O cuando se mueva 50 metros
          },
          (newLocation) => {
            const newLocationCoords = {
              latitude: newLocation.coords.latitude,
              longitude: newLocation.coords.longitude,
            };
            setDriverLocation(newLocationCoords);

            // Actualizar ubicación en Firestore
            if (driverId) {
              const db = getFirestore(app);
              const driverRef = doc(db, 'drivers', driverId);
              updateDoc(driverRef, {
                location: newLocationCoords,
                updatedAt: new Date().toISOString()
              }).catch(error => {
                console.error('Error al actualizar ubicación:', error);
              });
            }
          }
        );
      } catch (error) {
        console.error('Error al obtener ubicación:', error);
      }
    };

    if (driverId) {
      getCurrentLocation();
    }

    return () => {
      if (locationSubscription) {
        locationSubscription.remove();
      }
    };
  }, [driverId]);

  useEffect(() => {
    if (!driverId) return;

    const db = getFirestore(app);
    const q = query(
      collection(db, 'rideRequests'),
      where('driverId', '==', driverId),
      where('status', '==', 'accepted')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setIsLoading(false);
      setHasCheckedForRide(true);
      
      if (!snapshot.empty) {
        const rideDoc = snapshot.docs[0];
        const rideData = { id: rideDoc.id, ...rideDoc.data() } as RideData;
        console.log('Datos del viaje:', rideData);
        setRide(rideData);
      } else {
        console.log('No se encontró ningún viaje activo');
        setRide(null);
      }
    }, (error) => {
      console.error('Error al obtener el viaje:', error);
      setIsLoading(false);
      setHasCheckedForRide(true);
    });

    return () => unsubscribe();
  }, [driverId]);

  const handleFinishRide = async () => {
    if (!ride) return;

    try {
      const db = getFirestore(app);
      const rideRef = doc(db, 'rideRequests', ride.id);
      
      await updateDoc(rideRef, {
        status: 'completed',
        updatedAt: new Date().toISOString()
      });

      Alert.alert(
        'Viaje Finalizado',
        'El viaje ha sido finalizado exitosamente',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/driver/driver_availability')
          }
        ]
      );
    } catch (error) {
      console.error('Error al finalizar el viaje:', error);
      Alert.alert('Error', 'No se pudo finalizar el viaje');
    }
  };

  const handleCancelRide = async () => {
    if (!ride) return;

    try {
      const db = getFirestore(app);
      const rideRef = doc(db, 'rideRequests', ride.id);
      
      await updateDoc(rideRef, {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
        cancellationReason: 'Cancelado por el conductor'
      });

      Alert.alert(
        'Viaje Cancelado',
        'El viaje ha sido cancelado',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/driver/driver_availability')
          }
        ]
      );
    } catch (error) {
      console.error('Error al cancelar el viaje:', error);
      Alert.alert('Error', 'No se pudo cancelar el viaje');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Viaje Activo</Text>
          <Text style={styles.headerSubtitle}>Estado del viaje actual</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>⏳</Text>
              </View>
              <Text style={styles.cardTitle}>Cargando información</Text>
            </View>
            
            <Text style={styles.cardDescription}>
              Verificando si tienes un viaje activo en este momento...
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (hasCheckedForRide && !ride) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Viaje Activo</Text>
          <Text style={styles.headerSubtitle}>Estado del viaje actual</Text>
        </View>
        
        <View style={styles.content}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>🚗</Text>
              </View>
              <Text style={styles.cardTitle}>No hay viaje activo</Text>
            </View>
            
            <Text style={styles.cardDescription}>
              No tienes ningún viaje en progreso en este momento. 
              Cuando aceptes una solicitud de viaje, aparecerá aquí.
            </Text>
            
            <TouchableOpacity 
              style={styles.primaryButton} 
              onPress={() => router.back()}
            >
              <Text style={styles.primaryButtonText}>Volver al Inicio</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <Text style={styles.loadingText}>Cargando información del viaje...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: ride.origin.coordinates.latitude,
          longitude: ride.origin.coordinates.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker
          coordinate={ride.origin.coordinates}
          title="Usuario (Origen)"
          pinColor="green"
        />
        <Marker
          coordinate={ride.destination.coordinates}
          title="Destino"
          pinColor="red"
        />
        
        {/* Marcador del conductor */}
        {driverLocation && (
          <Marker
            coordinate={driverLocation}
            title="Tu ubicación"
          >
            <View style={styles.driverMarker}>
              <Text style={styles.driverMarkerText}>🚗</Text>
            </View>
          </Marker>
        )}

        {/* Ruta del conductor hacia el usuario */}
        {driverLocation && (
          <MapViewDirections
            origin={driverLocation}
            destination={ride.origin.coordinates}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#10B981"
            onReady={result => {
              setEtaToUser(result.duration);
              console.log('ETA hacia el usuario:', result.duration, 'minutos');
            }}
          />
        )}

        {/* Ruta del viaje completo */}
        <MapViewDirections
          origin={ride.origin.coordinates}
          destination={ride.destination.coordinates}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={4}
          strokeColor="#2563EB"
          onReady={result => {
            setTripDuration(result.duration);
            console.log('Duración del viaje:', result.duration, 'minutos');
          }}
        />
      </MapView>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>🚗 Viaje en Curso</Text>
        
        <View style={styles.etaCard}>
          {etaToUser !== null && (
            <Text style={styles.etaText}>⏱️ Tiempo para recoger al usuario: {Math.round(etaToUser)} min</Text>
          )}
          {tripDuration !== null && (
            <Text style={styles.etaText}>🛣️ Duración total del viaje: {Math.round(tripDuration)} min</Text>
          )}
        </View>

        <Text style={styles.address}>📍 Origen: {ride.origin.address}</Text>
        <Text style={styles.address}>🎯 Destino: {ride.destination.address}</Text>
        <Text style={styles.price}>💰 Precio: ${ride.price?.toFixed(2) || '0.00'}</Text>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.cancelButton]}
            onPress={() => {
              Alert.alert(
                'Cancelar Viaje',
                '¿Estás seguro que deseas cancelar este viaje?',
                [
                  {
                    text: 'No',
                    style: 'cancel'
                  },
                  {
                    text: 'Sí, Cancelar',
                    style: 'destructive',
                    onPress: handleCancelRide
                  }
                ]
              );
            }}
          >
            <Text style={styles.buttonText}>❌ Cancelar Viaje</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.finishButton]}
            onPress={() => {
              Alert.alert(
                'Finalizar Viaje',
                '¿Has llegado al destino?',
                [
                  {
                    text: 'No',
                    style: 'cancel'
                  },
                  {
                    text: 'Sí, Finalizar',
                    onPress: handleFinishRide
                  }
                ]
              );
            }}
          >
            <Text style={styles.buttonText}>✅ Finalizar Viaje</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DriverRideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#1F2937',
  },
  address: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#10B981',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  button: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#EF4444',
  },
  finishButton: {
    backgroundColor: '#2563EB',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingContent: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 18,
    color: '#6b7280',
    textAlign: 'center',
  },
  driverMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  driverMarkerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  etaCard: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  etaText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 5,
    fontWeight: '500',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2563EB',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
  },
  content: {
    flex: 1,
    padding: 20,
    paddingTop: 30,
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  iconContainer: {
    backgroundColor: '#2563EB',
    padding: 10,
    borderRadius: 10,
    marginRight: 10,
  },
  icon: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardDescription: {
    color: '#4B5563',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 