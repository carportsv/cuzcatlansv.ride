import { app } from '@/services/firebaseConfig';
import { RideData } from '@/services/rideService';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getDoc, getFirestore, onSnapshot } from 'firebase/firestore';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

const UserActiveRideScreen = () => {
  const router = useRouter();
  const mapRef = useRef<MapView>(null);
  const { rideId } = useLocalSearchParams();
  const [ride, setRide] = useState<RideData | null>(null);
  const [loading, setLoading] = useState(true);
  const [eta, setEta] = useState<number | null>(null);
  const [driverInfo, setDriverInfo] = useState<any>(null);

  // Función para obtener información del conductor
  const fetchDriverInfo = async (driverId: string) => {
    try {
      const db = getFirestore(app);
      const driverDoc = await getDoc(doc(db, 'drivers', driverId));
      if (driverDoc.exists()) {
        const driverData = driverDoc.data();
        setDriverInfo(driverData);
        
        // Actualizar el viaje con la información del conductor
        if (ride) {
          setRide({
            ...ride,
            driverName: driverData.name,
            driverCar: driverData.car,
            driverLocation: driverData.location
          });
        }
      }
    } catch (error) {
      console.error('Error al obtener información del conductor:', error);
    }
  };

  useEffect(() => {
    if (!rideId) {
      Alert.alert('Error', 'No se encontró el ID del viaje');
      router.back();
      return;
    }

    const db = getFirestore(app);
    const rideRef = doc(db, 'rideRequests', rideId as string);
    
    const unsubscribe = onSnapshot(rideRef, (doc) => {
      if (doc.exists()) {
        const rideData = { id: doc.id, ...doc.data() } as RideData;
        setRide(rideData);
        setLoading(false);

        // Si el viaje fue aceptado y hay un conductor asignado, obtener su información
        if (rideData.status === 'accepted' && rideData.driverId) {
          fetchDriverInfo(rideData.driverId);
        }

        // Centrar el mapa en el origen o en la ruta cuando los datos estén listos
        if (mapRef.current && rideData.origin && rideData.destination) {
          const originCoords = rideData.origin.coordinates;
          const destinationCoords = rideData.destination.coordinates;
          mapRef.current.fitToSuppliedMarkers(['origin', 'destination'], { edgePadding: { top: 50, right: 50, bottom: 50, left: 50 }, animated: true });
        }

      } else {
        Alert.alert('Viaje no encontrado', 'La información del viaje no está disponible.');
        router.replace('/user/user_drivers'); // O a la pantalla principal del usuario
      }
    }, (error) => {
      console.error('Error al obtener el viaje:', error);
      Alert.alert('Error', 'No se pudo cargar la información del viaje');
      setLoading(false);
    });

    return () => unsubscribe();
  }, [rideId, router]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.loadingText}>Cargando información del viaje...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.center}>
        <Text style={styles.loadingText}>No hay información de viaje disponible.</Text>
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
          identifier="origin"
          coordinate={ride.origin.coordinates}
          title="Origen"
          pinColor="green"
        />
        <Marker
          identifier="destination"
          coordinate={ride.destination.coordinates}
          title="Destino"
          pinColor="red"
        />
        {ride.driverId && ride.status === 'accepted' && ride.driverLocation && (
          <Marker
            coordinate={ride.driverLocation}
            title="Tu Conductor"
          >
            <View style={styles.driverMarker}>
              <Ionicons name="car" size={24} color="#10B981" />
            </View>
          </Marker>
        )}
        {ride.status === 'accepted' && ride.driverId && ride.driverLocation && (
          <MapViewDirections
            origin={ride.driverLocation}
            destination={ride.origin.coordinates}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#2563EB"
            onReady={result => {
              setEta(result.duration);
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
                animated: true,
              });
            }}
          />
        )}
        {ride.status === 'accepted' && ride.driverId && (
          <MapViewDirections
            origin={ride.origin.coordinates}
            destination={ride.destination.coordinates}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor="#2563EB"
          />
        )}
      </MapView>

      <View style={styles.infoContainer}>
        <Text style={styles.title}>Estado del Viaje: {ride.status}</Text>
        <Text style={styles.address}>Origen: {ride.origin.address}</Text>
        <Text style={styles.address}>Destino: {ride.destination.address}</Text>
        {ride.price && <Text style={styles.price}>Precio Estimado: ${ride.price.toFixed(2)}</Text>}
        
        {ride.status === 'accepted' && ride.driverId && (
          <View style={styles.driverCard}>
            <Text style={styles.driverTitle}>🚗 Tu Conductor</Text>
            <Text style={styles.driverInfo}>Nombre: {ride.driverName || 'Cargando...'}</Text>
            <Text style={styles.driverInfo}>Estado: En camino hacia ti</Text>
            {eta !== null && (
              <Text style={styles.etaText}>⏱️ Llegará en: {Math.round(eta)} minutos</Text>
            )}
            {ride.driverCar && (
              <Text style={styles.driverInfo}>🚙 {ride.driverCar.model} - {ride.driverCar.plate}</Text>
            )}
          </View>
        )}

        {ride.status === 'requested' && (
          <View style={styles.waitingCard}>
            <Text style={styles.waitingText}>⏳ Esperando que un conductor acepte tu viaje...</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.cancelButton}
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
                  onPress: () => {
                    // Lógica para cancelar el viaje (se implementará más adelante)
                    router.replace('/user/user_drivers');
                  }
                }
              ]
            );
          }}
        >
          <Text style={styles.buttonText}>Cancelar Viaje</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default UserActiveRideScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#4B5563',
    marginTop: 10,
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
    marginBottom: 15,
  },
  driverInfo: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 5,
  },
  waitingText: {
    fontSize: 16,
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  cancelButton: {
    backgroundColor: '#EF4444',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverMarker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  driverCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  driverTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1F2937',
  },
  etaText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 5,
  },
  waitingCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
}); 