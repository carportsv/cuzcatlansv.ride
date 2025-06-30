import { createRideRequest } from '@/services/rideService';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import Constants from 'expo-constants';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';

// Obtener la API key de las constantes de Expo
const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.googleMapsApiKey || '';

// Mostrar la API Key para depuración
console.log('GOOGLE_MAPS_API_KEY:', GOOGLE_MAPS_API_KEY);

// Mostrar la API Key real para depuración
console.log('GOOGLE_MAPS_API_KEY (real):', GOOGLE_MAPS_API_KEY);

// Función para enviar notificación push a un array de tokens Expo
async function sendPushNotificationToDrivers(tokens: string[], title: string, body: string) {
  const messages = tokens.map(token => ({
    to: token,
    sound: 'default',
    title,
    body,
    data: { type: 'ride_request' },
  }));
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
    return await response.json();
  } catch (error) {
    console.error('Error enviando notificación push:', error);
    return null;
  }
}

const UserRideSummaryScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [selectedDriver, setSelectedDriver] = useState<any>(null);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const params = useLocalSearchParams();
  
  const origin = params.origin as string || '';
  const destination = params.destination as string || '';
  const originLat = params.originLat as string || '';
  const originLng = params.originLng as string || '';
  const destLat = params.destLat as string || '';
  const destLng = params.destLng as string || '';

  const price = Math.floor(Math.random() * 20) + 10; // Precio aleatorio entre 10 y 30

  const originCoords = {
    latitude: originLat ? parseFloat(originLat) : 0,
    longitude: originLng ? parseFloat(originLng) : 0,
  };

  const destinationCoords = {
    latitude: destLat ? parseFloat(destLat) : 0,
    longitude: destLng ? parseFloat(destLng) : 0,
  };

  const [tripDuration, setTripDuration] = useState<number | null>(null);
  const [eta, setEta] = useState<number | null>(null);
  const mapDirectionsRef = useRef<any>(null);

  // Validar que tenemos todos los datos necesarios
  useEffect(() => {
    if (!origin || !destination || !originLat || !originLng || !destLat || !destLng) {
      Alert.alert('Error', 'Datos incompletos para mostrar el resumen del viaje');
      router.back();
    }
  }, []);

  // Consultar conductores disponibles
  useEffect(() => {
    setLoadingDrivers(true);
    const unsubscribe = firestore()
      .collection('drivers')
      .where('isAvailable', '==', true)
      .onSnapshot(snapshot => {
        const availableDrivers = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data
          };
        });
        setDrivers(availableDrivers);
        setLoadingDrivers(false);
        // Seleccionar el primero por defecto si hay disponibles
        if (availableDrivers.length > 0 && !selectedDriver) {
          setSelectedDriver(availableDrivers[0]);
        }
      }, (err) => {
        setLoadingDrivers(false);
        Alert.alert('Error', 'No se pudo obtener la lista de conductores');
      });
    return () => unsubscribe();
  }, []);

  const handleConfirmRide = async () => {
    try {
      setIsLoading(true);
      const userId = await AsyncStorage.getItem('userUID');
      if (!userId) {
        Alert.alert('Error', 'No se pudo obtener la información del usuario');
        return;
      }
      // Obtener tokens push de conductores disponibles
      const driversSnapshot = await firestore()
        .collection('drivers')
        .where('isAvailable', '==', true)
        .get();
      const tokens: string[] = [];
      driversSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.pushToken) tokens.push(data.pushToken);
      });
      // Enviar notificación push a todos los conductores disponibles
      if (tokens.length > 0) {
        await sendPushNotificationToDrivers(tokens, 'Nueva solicitud de viaje', '¡Un usuario ha solicitado un taxi!');
      }
      const rideRequest = await createRideRequest({
        userId,
        origin: {
          address: origin,
          coordinates: originCoords,
        },
        destination: {
          address: destination,
          coordinates: destinationCoords,
        },
      });
      Alert.alert('¡Taxi solicitado!', 'Tu taxi está en camino.');
      router.replace('/user/user_home');
    } catch (error) {
      console.error('Error al crear la solicitud:', error);
      Alert.alert('Error', 'No se pudo crear la solicitud de viaje');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Resumen del Viaje</Text>
      <Text>Origen: {origin}</Text>
      <Text>Destino: {destination}</Text>
      <Text>Precio estimado: ${price}</Text>
      <Text style={{ fontSize: 10, color: GOOGLE_MAPS_API_KEY ? '#888' : 'red', marginBottom: 4 }}>
        API Key: {GOOGLE_MAPS_API_KEY || 'NO DEFINIDA'}
      </Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: originCoords.latitude,
          longitude: originCoords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={originCoords} title="Origen" pinColor="green" />
        <Marker coordinate={destinationCoords} title="Destino" pinColor="red" />
        <MapViewDirections
          ref={mapDirectionsRef}
          origin={originCoords}
          destination={destinationCoords}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={4}
          strokeColor="blue"
          onReady={result => {
            console.log('MapViewDirections result:', result);
            if (result && typeof result.duration === 'number') {
              setTripDuration(result.duration);
              console.log('Duración del viaje (min):', result.duration);
            } else {
              setTripDuration(null);
              console.warn('No se recibió duración en MapViewDirections');
            }
          }}
        />
        {/* ETA del taxi si hay conductor disponible y ubicación */}
        {selectedDriver && selectedDriver.location && (
          <MapViewDirections
            origin={selectedDriver.location}
            destination={originCoords}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={2}
            strokeColor="#10B981"
            onReady={result => {
              setEta(result.duration);
              console.log('ETA del taxi (min):', result.duration);
            }}
          />
        )}
      </MapView>
      {drivers.length === 0 && (
        <Text style={{ color: 'red', marginTop: 10, textAlign: 'center', fontWeight: 'bold' }}>
          No hay conductores disponibles en este momento.
        </Text>
      )}
      <TouchableOpacity
        style={[styles.button, (isLoading || drivers.length === 0) && styles.buttonDisabled]}
        onPress={handleConfirmRide}
        disabled={isLoading || drivers.length === 0}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Solicitando...' : 'Confirmar y Tomar Taxi'}
        </Text>
      </TouchableOpacity>
      {tripDuration === null && (
        <Text style={{ marginTop: 10, textAlign: 'center', color: 'red', fontWeight: 'bold' }}>
          No se pudo calcular el tiempo estimado de viaje.
        </Text>
      )}
      {eta !== null && (
        <Text style={{ marginTop: 4, textAlign: 'center', color: '#10B981', fontWeight: 'bold' }}>
          El taxi está a {Math.round(eta)} min de tu ubicación
        </Text>
      )}
    </View>
  );
};

export default UserRideSummaryScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  map: {
    height: 300,
    marginVertical: 20,
    borderRadius: 10,
  },
  button: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#93C5FD',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  driverCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 16,
    marginRight: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 100,
  },
  driverCardSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#DBEAFE',
  },
}); 