import { testCreateRideRequest } from '@/services/firebaseTest';
import { createRideRequest, watchAvailableDrivers } from '@/services/rideService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
const SHEET_MIN_HEIGHT = height * 0.25;
const SHEET_MAX_HEIGHT = height * 0.6;
const SHEET_SNAP_POINTS = {
  HIDDEN: height,
  COLLAPSED: 0,
  EXPANDED: -(SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT)
};

const INITIAL_REGION = {
  latitude: 13.6929403,
  longitude: -89.2181911,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

// Datos de ejemplo de conductores disponibles
const mockDrivers = [
  {
    id: '1',
    name: 'Juan Pérez',
    rating: 4.8,
    distance: '0.5 km',
    location: {
      latitude: 13.6929403,
      longitude: -89.2181911,
    },
    car: {
      model: 'Toyota Corolla',
      plate: 'ABC-123',
    }
  },
  {
    id: '2',
    name: 'María López',
    rating: 4.9,
    distance: '1.2 km',
    location: {
      latitude: 13.6929403 + 0.01,
      longitude: -89.2181911 + 0.01,
    },
    car: {
      model: 'Honda Civic',
      plate: 'XYZ-789',
    }
  }
];

interface Driver {
  id: string;
  name: string;
  rating?: number;
  car?: {
    model: string;
    plate: string;
  };
  location?: {
    latitude: number;
    longitude: number;
  };
}

const UserDriversScreen = () => {
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [originCoords, setOriginCoords] = useState<any>(null);
  const [destinationCoords, setDestinationCoords] = useState<any>(null);
  const sheetPosition = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          sheetPosition.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 50) {
          toggleSheet(false);
        } else {
          toggleSheet(true);
        }
      },
    })
  ).current;

  const toggleSheet = (show: boolean, expand: boolean = false) => {
    const toValue = show 
      ? (expand ? SHEET_SNAP_POINTS.EXPANDED : SHEET_SNAP_POINTS.COLLAPSED) 
      : SHEET_SNAP_POINTS.HIDDEN;

    Animated.spring(sheetPosition, {
      toValue,
      useNativeDriver: true,
      tension: 65,
      friction: 12
    }).start(() => {
      setSheetVisible(show);
      setIsSheetExpanded(expand);
    });
  };

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };

      setRegion(newRegion);
      setUserLocation(newRegion);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    const initLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await getCurrentLocation();
      } else {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para funcionar correctamente');
      }
    };

    initLocation();
  }, []);

  useEffect(() => {
    const loadUserId = async () => {
      const storedUserId = await AsyncStorage.getItem('userUID');
      setUserId(storedUserId);
    };

    loadUserId();
  }, []);

  useEffect(() => {
    if (!userId) {
      console.log('No hay userId, no se pueden buscar conductores');
      return;
    }

    console.log('Iniciando búsqueda de conductores disponibles...');
    console.log('UserID:', userId);
    
    const unsubscribe = watchAvailableDrivers((availableDrivers) => {
      console.log('Conductores disponibles recibidos:', JSON.stringify(availableDrivers, null, 2));
      if (availableDrivers.length === 0) {
        console.log('No hay conductores disponibles');
      } else {
        console.log('Número de conductores disponibles:', availableDrivers.length);
        availableDrivers.forEach(driver => {
          console.log('Conductor:', {
            id: driver.id,
            name: driver.name,
            isAvailable: driver.isAvailable,
            location: driver.location
          });
        });
      }
      setDrivers(availableDrivers);
    });

    return () => {
      console.log('Deteniendo búsqueda de conductores...');
      unsubscribe();
    };
  }, [userId]);

  // Agregar useEffect para debug del estado drivers
  useEffect(() => {
    console.log('Estado de drivers actualizado:', drivers.length, 'conductores');
    console.log('Conductores:', JSON.stringify(drivers, null, 2));
  }, [drivers]);

  const handleTestRideRequest = async () => {
    try {
      console.log('🧪 Probando creación de solicitud de viaje...');
      const result = await testCreateRideRequest();
      
      if (result.success) {
        Alert.alert('Prueba Exitosa', `Solicitud creada con ID: ${result.id}`);
      } else {
        Alert.alert('Prueba Fallida', `Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error en prueba:', error);
      Alert.alert('Error en Prueba', 'No se pudo completar la prueba');
    }
  };

  const handleRequestRide = async () => {
    console.log('=== INICIANDO SOLICITUD DE VIAJE ===');
    console.log('Origen:', origin);
    console.log('Destino:', destination);
    console.log('Coordenadas origen:', originCoords);
    console.log('Coordenadas destino:', destinationCoords);
    
    if (!origin || !destination || !originCoords || !destinationCoords) {
      console.log('❌ Faltan datos de origen o destino');
      Alert.alert('Error', 'Por favor ingrese origen y destino');
      return;
    }

    try {
      console.log('🔍 Obteniendo userId de AsyncStorage...');
      const userId = await AsyncStorage.getItem('userUID');
      console.log('UserId obtenido:', userId);
      
      if (!userId) {
        console.log('❌ No se pudo obtener el userId');
        Alert.alert('Error', 'No se pudo obtener el ID del usuario');
        return;
      }

      console.log('🔍 Verificando conductores disponibles...');
      console.log('Conductores en estado:', drivers);
      
      // Encontrar el conductor más cercano
      const nearestDriver = drivers.length > 0 ? drivers[0] : null;
      console.log('Conductor seleccionado:', nearestDriver);
      
      if (!nearestDriver) {
        console.log('❌ No hay conductores disponibles');
        Alert.alert('Error', 'No hay conductores disponibles en este momento');
        return;
      }

      // Crear la solicitud de viaje con la estructura correcta
      const rideRequest = {
        userId,
        driverId: nearestDriver.id,
        origin: {
          address: origin,
          coordinates: {
            latitude: originCoords.latitude,
            longitude: originCoords.longitude
          }
        },
        destination: {
          address: destination,
          coordinates: {
            latitude: destinationCoords.latitude,
            longitude: destinationCoords.longitude
          }
        }
      };

      console.log('📝 Creando solicitud de viaje:', JSON.stringify(rideRequest, null, 2));
      
      const rideRequestResult = await createRideRequest(rideRequest);
      console.log('✅ Solicitud creada exitosamente:', rideRequestResult);
      
      Alert.alert('Éxito', 'Solicitud de taxi enviada. Espere mientras el conductor confirma.');
      
      console.log('🔄 Navegando a user_active_ride con rideId:', rideRequestResult.id);
      router.push({
        pathname: '/user/user_active_ride',
        params: { rideId: rideRequestResult.id }
      });
      
    } catch (error) {
      console.error('❌ Error al solicitar viaje:', error);
      console.error('Stack trace:', (error as Error).stack);
      Alert.alert('Error', 'No se pudo crear la solicitud de viaje: ' + (error as Error).message);
    }
  };

  const renderDriverItem = ({ item }: { item: Driver }) => (
    <TouchableOpacity
      style={[
        styles.driverItem,
        selectedDriver?.id === item.id && styles.selectedDriver
      ]}
      onPress={() => setSelectedDriver(item)}
    >
      <View style={styles.driverInfo}>
        <Text style={styles.driverName}>{item.name || 'Conductor'}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.ratingText}>{item.rating || 'Nuevo'}</Text>
        </View>
        <Text style={styles.carInfo}>
          {item.car?.model || 'Sin información'} - {item.car?.plate || 'Sin placa'}
        </Text>
        <Text style={styles.distanceText}>
          {item.location ? 'Cerca de tu ubicación' : 'Ubicación no disponible'}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text>Cargando mapa...</Text>
      </View>
    );
  }

  const apiKey = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  console.log('API KEY GOOGLE MAPS:', apiKey);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        showsUserLocation
        showsMyLocationButton
      >
        {userLocation && (
          <Marker
            coordinate={{
              latitude: userLocation.latitude,
              longitude: userLocation.longitude,
            }}
            title="Tu ubicación"
          >
            <View style={styles.userMarker}>
              <Ionicons name="person" size={24} color="#2563EB" />
            </View>
          </Marker>
        )}
        {drivers.map((driver) => (
          driver.location && (
            <Marker
              key={driver.id}
              coordinate={{
                latitude: driver.location.latitude,
                longitude: driver.location.longitude,
              }}
              title={`${driver.name || 'Conductor'} - ${driver.car?.model || 'Sin información'}`}
              description={`Placa: ${driver.car?.plate || 'No disponible'}`}
            >
              <View style={styles.driverMarker}>
                <Ionicons name="car" size={24} color="#10B981" />
              </View>
            </Marker>
          )
        ))}
        {originCoords && (
          <Marker
            coordinate={originCoords}
            title="Origen"
            pinColor="green"
          />
        )}
        {destinationCoords && (
          <Marker
            coordinate={destinationCoords}
            title="Destino"
            pinColor="red"
          />
        )}
      </MapView>

      <Animated.View
        style={[
          styles.sheet,
          {
            transform: [{ translateY: sheetPosition }],
            zIndex: isSheetExpanded ? 2 : 1,
          },
        ]}
      >
        <View {...panResponder.panHandlers} style={styles.dragHandle}>
          <View style={styles.handleIndicator} />
        </View>
        <View style={styles.sheetContent}>
          <Text style={styles.title}>Solicitar Taxi</Text>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleRequestRide}
          >
            <Text style={styles.buttonText}>Solicitar Taxi</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.button, styles.testButton]} 
            onPress={handleTestRideRequest}
          >
            <Text style={styles.buttonText}>🧪 Probar Creación</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
};

export default UserDriversScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: SHEET_MIN_HEIGHT,
    maxHeight: SHEET_MAX_HEIGHT,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dragHandle: {
    width: '100%',
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handleIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DEE1E6',
    marginTop: 8,
  },
  sheetContent: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: '#1F2937',
  },
  button: {
    backgroundColor: '#2563EB',
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
  userMarker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#2563EB',
  },
  driverMarker: {
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  driverItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginBottom: 10,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#F59E0B',
    marginLeft: 4,
  },
  carInfo: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  distanceText: {
    fontSize: 14,
    color: '#6B7280',
  },
  selectedDriver: {
    backgroundColor: '#EFF6FF',
    borderColor: '#2563EB',
    borderWidth: 1,
  },
  testButton: {
    backgroundColor: '#10B981',
    marginTop: 10,
  },
});

const autocompleteStyles = {
  textInputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    marginBottom: 10,
  },
  textInput: {
    height: 44,
    color: '#5d5d5d',
    fontSize: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 10,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  listView: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 5,
  },
  row: {
    padding: 13,
    height: 44,
    flexDirection: 'row',
  },
  separator: {
    height: 0.5,
    backgroundColor: '#c8c7cc',
  },
}; 