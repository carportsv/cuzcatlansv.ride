import { acceptRide, RideData, updateDriverAvailability, watchRideRequests } from '@/services/rideService';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import * as Device from 'expo-device';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, AppState, Dimensions, PanResponder, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';

const { width, height } = Dimensions.get('window');
const SHEET_MIN_HEIGHT = height * 0.25;
const SHEET_MAX_HEIGHT = height * 0.5;
const SHEET_SNAP_POINTS = {
  HIDDEN: height,
  COLLAPSED: 0,
  EXPANDED: -(SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT)
};

const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = 0.02;

const INITIAL_REGION = {
  latitude: 13.6929403,
  longitude: -89.2181911,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const db = firestore();

const DriverAvailabilityScreen = () => {
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(true);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [rideRequests, setRideRequests] = useState<RideData[]>([]);
  const sheetPosition = useRef(new Animated.Value(0)).current;
  const mapRef = useRef<MapView>(null);
  const router = useRouter();
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();

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

      if (location?.coords?.latitude && location?.coords?.longitude) {
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        };

        setRegion(newRegion);
        setUserLocation(newRegion);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación.');
      setLoading(false);
    }
  };

  const watchLocation = async () => {
    try {
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000,
          distanceInterval: 50
        },
        async (location) => {
          if (location?.coords?.latitude && location?.coords?.longitude) {
            const newRegion = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: LATITUDE_DELTA,
              longitudeDelta: LONGITUDE_DELTA,
            };
            setUserLocation(newRegion);
            setRegion(newRegion);

            // Actualizar la ubicación en Firestore si el conductor está disponible
            if (isAvailable && driverId) {
              try {
                await db.collection('drivers').doc(driverId).update({
                  location: {
                    latitude: location.coords.latitude,
                    longitude: location.coords.longitude
                  },
                  updatedAt: new Date().toISOString(),
                  isAvailable: true // Asegurarnos de que siga disponible
                });
              } catch (error) {
                console.error('Error al actualizar ubicación:', error);
              }
            }
          }
        }
      );

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
        }
      };
    } catch (error) {
      console.error('Error watching location:', error);
    }
  };

  useEffect(() => {
    let locationCleanup: (() => void) | undefined;

    const initLocation = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        await getCurrentLocation();
        locationCleanup = await watchLocation();
      } else {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para funcionar correctamente');
      }
    };

    initLocation();

    return () => {
      if (locationCleanup) {
        locationCleanup();
      }
    };
  }, []);

  useEffect(() => {
    const loadDriverId = async () => {
      const storedDriverId = await AsyncStorage.getItem('userUID');
      setDriverId(storedDriverId);
      
      // Cargar el estado de disponibilidad guardado
      const storedAvailability = await AsyncStorage.getItem('driverAvailability');
      if (storedAvailability !== null) {
        setIsAvailable(JSON.parse(storedAvailability));
      }
    };

    loadDriverId();
  }, []);

  useEffect(() => {
    if (!driverId) return;

    console.log('Iniciando escucha de solicitudes de viaje...');
    const unsubscribe = watchRideRequests(driverId, async (rides) => {
      console.log('Solicitudes de viaje:', rides);
      setRideRequests(rides as unknown as RideData[]);

      // Enviar notificación por cada nueva solicitud
      for (const ride of rides) {
        try {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '¡Nueva solicitud de viaje!',
              body: `Viaje desde ${ride.origin.address}`,
              data: { rideId: ride.id },
              sound: true,
              priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null, // Enviar inmediatamente
          });
        } catch (error) {
          console.error('Error al enviar notificación:', error);
        }
      }
    });

    return () => unsubscribe();
  }, [driverId]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        // Si el conductor está disponible, mantener el estado
        if (isAvailable && driverId) {
          try {
            await updateDriverAvailability(driverId, true);
            await AsyncStorage.setItem('driverAvailability', JSON.stringify(true));
          } catch (error) {
            console.error('Error al mantener disponibilidad:', error);
          }
        }
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isAvailable, driverId]);

  const toggleAvailability = async () => {
    if (!driverId) {
      Alert.alert('Error', 'No se pudo obtener el ID del conductor');
      return;
    }

    const newAvailability = !isAvailable;
    try {
      await updateDriverAvailability(driverId, newAvailability);
      setIsAvailable(newAvailability);
      // Guardar el estado de disponibilidad en AsyncStorage
      await AsyncStorage.setItem('driverAvailability', JSON.stringify(newAvailability));
    } catch (error) {
      console.error('Error al actualizar disponibilidad:', error);
      Alert.alert('Error', 'No se pudo actualizar la disponibilidad');
    }
  };

  const handleRideRequest = (ride: RideData) => {
    Alert.prompt(
      'Nueva solicitud de viaje',
      `¿Cuál será el precio del viaje desde ${ride.origin.address}?`,
      [
        {
          text: 'Rechazar',
          style: 'cancel',
        },
        {
          text: 'Aceptar',
          onPress: async (price) => {
            if (!driverId) return;
            if (!price || isNaN(Number(price))) {
              Alert.alert('Error', 'Por favor ingrese un precio válido');
              return;
            }

            try {
              await acceptRide(ride.id, driverId, Number(price));
              router.push('/driver/driver_ride');
            } catch (error) {
              console.error('Error al aceptar viaje:', error);
              Alert.alert('Error', 'No se pudo aceptar el viaje');
            }
          },
        },
      ],
      'plain-text',
      '',
      'numeric'
    );
  };

  const renderRideRequest = ({ item }: { item: RideData }) => (
    <TouchableOpacity
      style={styles.rideRequestItem}
      onPress={() => handleRideRequest(item)}
    >
      <View style={styles.rideRequestInfo}>
        <Text style={styles.rideRequestTitle}>Nueva solicitud de viaje</Text>
        <Text style={styles.rideRequestAddress}>
          Origen: {item.origin.address || 'Ubicación no especificada'}
        </Text>
        <Text style={styles.rideRequestTime}>
          Hora: {new Date(item.createdAt).toLocaleTimeString()}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#9CA3AF" />
    </TouchableOpacity>
  );

  // Configurar las notificaciones
  useEffect(() => {
    registerForPushNotificationsAsync();
  }, []);

  async function registerForPushNotificationsAsync() {
    let token;

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        Alert.alert('Error', 'Se necesitan permisos para las notificaciones push');
        return;
      }
      
      token = (await Notifications.getExpoPushTokenAsync()).data;
      setExpoPushToken(token);

      // Guardar el token en Firestore
      if (driverId && token) {
        await db.collection('drivers').doc(driverId).update({
          pushToken: token,
          updatedAt: new Date().toISOString()
        });
      }
    } else {
      Alert.alert('Error', 'Las notificaciones push requieren un dispositivo físico');
    }
  }

  // Configurar el manejador de notificaciones
  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener((notification: Notifications.Notification) => {
      console.log('Notificación recibida:', notification);
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response: Notifications.NotificationResponse) => {
      const data = response.notification.request.content.data;
      if (data.rideId) {
        router.push('/driver/driver_availability');
      }
    });

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text>Cargando mapa...</Text>
      </View>
    );
  }

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
          <Text style={styles.title}>Estado del Conductor</Text>
          <View style={styles.statusContainer}>
            <Text style={styles.statusText}>
              {isAvailable ? 'Estás disponible para recibir viajes' : 'No estás disponible para recibir viajes'}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 16 }}>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: isAvailable ? '#10B981' : '#E5E7EB', marginRight: 10 },
                  { borderWidth: isAvailable ? 2 : 0, borderColor: '#10B981' },
                ]}
                disabled={isAvailable}
                onPress={async () => {
                  if (!isAvailable) await toggleAvailability();
                }}
              >
                <Text style={[styles.buttonText, { color: isAvailable ? '#fff' : '#10B981' }]}>Disponible</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.button,
                  { backgroundColor: !isAvailable ? '#E53E3E' : '#E5E7EB' },
                  { borderWidth: !isAvailable ? 2 : 0, borderColor: '#E53E3E' },
                ]}
                disabled={!isAvailable}
                onPress={async () => {
                  if (isAvailable) await toggleAvailability();
                }}
              >
                <Text style={[styles.buttonText, { color: !isAvailable ? '#fff' : '#E53E3E' }]}>No disponible</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

export default DriverAvailabilityScreen;

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
  statusContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  statusText: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rideRequestItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginBottom: 10,
  },
  rideRequestInfo: {
    flex: 1,
  },
  rideRequestTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  rideRequestAddress: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  rideRequestTime: {
    fontSize: 12,
    color: '#6B7280',
  },
});