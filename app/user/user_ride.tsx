import { MapSelector } from '@/components/MapSelector';
import PlaceInput from '@/components/PlaceInput';
import { useGeocoding } from '@/hooks/useGeocoding';
import { DriverData, watchAvailableDrivers } from '@/services/rideService';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  LogBox,
  PanResponder,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-get-random-values';
import { GooglePlaceData, GooglePlaceDetail, GooglePlacesAutocompleteRef } from 'react-native-google-places-autocomplete';
import MapView, { MapPressEvent, Region } from 'react-native-maps';

// Desactivar las advertencias de Reanimated
LogBox.ignoreLogs(['[Reanimated]']);

// Usar la API key de Android
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBW7YFauqJBbv6Xm8a1tsDLGVDzF6rXHhI';

// Constantes del BottomSheet
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const INITIAL_REGION = {
  latitude: 13.6929403,
  longitude: -89.2181911,
  latitudeDelta: LATITUDE_DELTA,
  longitudeDelta: LONGITUDE_DELTA,
};

const SHEET_MIN_HEIGHT = height * 0.25;
const SHEET_MAX_HEIGHT = height * 0.5;
const SHEET_SNAP_POINTS = {
  HIDDEN: height,
  COLLAPSED: 0,
  EXPANDED: -(SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT)
};

export const options = {
  headerShown: false,
};

export default function UserRideScreen(): React.ReactElement {
  const mapRef = useRef<MapView | null>(null);
  const originRef = useRef<GooglePlacesAutocompleteRef>(null);
  const destinationRef = useRef<GooglePlacesAutocompleteRef>(null);
  const [region, setRegion] = useState<Region>(INITIAL_REGION);
  const [userLocation, setUserLocation] = useState<Region | null>(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<'origin' | 'destination' | null>(null);
  const [isSheetExpanded, setIsSheetExpanded] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(true);
  const sheetPosition = useRef(new Animated.Value(0)).current;
  const [originText, setOriginText] = useState('');
  const [destinationText, setDestinationText] = useState('');
  const [originCoords, setOriginCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const [destinationCoords, setDestinationCoords] = useState<{ latitude: number, longitude: number } | null>(null);
  const router = useRouter();
  const { getAddressFromCoordinates } = useGeocoding();
  const [driverMarkers, setDriverMarkers] = useState<DriverData[]>([]);

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

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newY = Math.max(
          SHEET_SNAP_POINTS.EXPANDED,
          Math.min(SHEET_SNAP_POINTS.HIDDEN, gestureState.dy)
        );
        sheetPosition.setValue(newY);
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vy;
        const distance = gestureState.dy;
        
        // Determinar el punto más cercano basado en la velocidad y distancia
        if (velocity > 2) {
          // Deslizamiento muy rápido hacia abajo - ocultar
          toggleSheet(false);
        } else if (velocity < -2) {
          // Deslizamiento muy rápido hacia arriba - expandir
          toggleSheet(true, true);
        } else if (distance > SHEET_MIN_HEIGHT / 2) {
          // Ha movido más de la mitad hacia abajo - ocultar
          toggleSheet(false);
        } else if (distance < -SHEET_MIN_HEIGHT / 2) {
          // Ha movido más de la mitad hacia arriba - expandir
          toggleSheet(true, true);
        } else {
          // Volver a estado colapsado
          toggleSheet(true, false);
        }
      }
    })
  ).current;

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permiso denegado',
          'Necesitamos acceso a tu ubicación para mostrarte en el mapa.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return false;
      }
      return true;
    } catch (err) {
      console.warn(err);
      Alert.alert('Error', 'No se pudo obtener el permiso de ubicación');
      setLoading(false);
      return false;
    }
  };

  const watchLocation = async () => {
    try {
      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 30000,
          distanceInterval: 50,
        },
        (location) => {
          const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          };
          setUserLocation(newRegion);
          if (!origin) {
            setRegion(newRegion);
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

  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
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
    let locationCleanup: (() => void) | undefined;

    const initLocation = async () => {
      const hasPermission = await requestLocationPermission();
      if (hasPermission) {
        await getCurrentLocation();
        locationCleanup = await watchLocation();
      }
    };

    initLocation();

    return () => {
      if (locationCleanup) {
        locationCleanup();
      }
    };
  }, []);

  const handleMapPress = async (event: MapPressEvent) => {
    if (!selectedLocation) return;
    const { latitude, longitude } = event.nativeEvent.coordinate;
    try {
      const address = await getAddressFromCoordinates(latitude, longitude);
      if (selectedLocation === 'origin') {
        setOrigin(address);
        setOriginCoords({ latitude, longitude });
        setTimeout(() => {
          originRef.current?.setAddressText('');
          setTimeout(() => {
            originRef.current?.setAddressText(address);
          }, 50);
        }, 100);
      } else {
        setDestination(address);
        setDestinationCoords({ latitude, longitude });
        setTimeout(() => {
          destinationRef.current?.setAddressText('');
          setTimeout(() => {
            destinationRef.current?.setAddressText(address);
          }, 50);
        }, 100);
      }
      setSelectedLocation(null);
    } catch (e) {
      Alert.alert('Error', 'No se pudo obtener la dirección');
    }
  };

  const handleLocationSelect = (data: GooglePlaceData, details: GooglePlaceDetail | null, type: 'origin' | 'destination') => {
    if (details?.geometry) {
      const { location } = details.geometry;
      const coords = { latitude: location.lat, longitude: location.lng };
      if (type === 'origin') {
        setOrigin(data.description);
        setOriginCoords(coords);
      } else {
        setDestination(data.description);
        setDestinationCoords(coords);
      }
      setSelectedLocation(null);
    }
  };

  // Escuchar conductores disponibles en tiempo real
  useEffect(() => {
    const unsubscribe = watchAvailableDrivers((drivers) => {
      setDriverMarkers(drivers);
    });
    return () => {
      if (unsubscribe) unsubscribe();
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
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.container}>
        <MapSelector
          region={region}
          onPress={handleMapPress}
          userLocation={userLocation}
          originCoords={originCoords}
          destinationCoords={destinationCoords}
          driverMarkers={driverMarkers}
          style={styles.map}
        />

        {!sheetVisible && (
          <TouchableOpacity 
            style={styles.showSheetButton}
            onPress={() => toggleSheet(true, false)}
          >
            <Text style={styles.showSheetButtonText}>📍 Solicitar Taxi</Text>
          </TouchableOpacity>
        )}

        {selectedLocation && (
          <View style={styles.mapOverlay}>
            <Text style={styles.overlayText}>
              Toca el mapa para seleccionar el punto de {selectedLocation === 'origin' ? 'inicio' : 'destino'}
            </Text>
          </View>
        )}

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
            <PlaceInput
              placeholder="Punto de inicio"
              onPress={(data: { description: string; place_id: string; coords?: { latitude: number; longitude: number } }) => {
                setOrigin(data.description);
                if (data.coords) {
                  setOriginCoords(data.coords);
                } else {
                  setOriginCoords(null);
                }
              }}
              textInputProps={{
                onFocus: () => setSelectedLocation('origin'),
              }}
              styles={autocompleteStyles}
            />
            <PlaceInput
              placeholder="Destino"
              onPress={(data: { description: string; place_id: string; coords?: { latitude: number; longitude: number } }) => {
                setDestination(data.description);
                if (data.coords) {
                  setDestinationCoords(data.coords);
                } else {
                  setDestinationCoords(null);
                }
              }}
              textInputProps={{
                onFocus: () => setSelectedLocation('destination'),
              }}
              styles={autocompleteStyles}
            />
            <TouchableOpacity 
              style={styles.button}
              onPress={() => {
                if (!origin || !destination || !originCoords || !destinationCoords) {
                  Alert.alert('Completa ambos campos', 'Debes ingresar origen y destino');
                  return;
                }
                router.push({
                  pathname: '/user/user_ride_summary',
                  params: {
                    origin,
                    destination,
                    originLat: originCoords.latitude,
                    originLng: originCoords.longitude,
                    destLat: destinationCoords.latitude,
                    destLng: destinationCoords.longitude,
                  }
                });
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Solicitar Taxi</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </GestureHandlerRootView>
  );
}

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
  inputContainer: {
    marginBottom: 10,
    position: 'relative',
  },
  markerContainer: {
    backgroundColor: '#2563EB',
    borderRadius: 20,
    padding: 8,
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerText: {
    fontSize: 24,
  },
  mapOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
  },
  overlayText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
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
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
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
  showSheetButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#2563EB',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  showSheetButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textInput: {
    height: 44,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  loader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  predictionsContainer: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    maxHeight: 200,
    zIndex: 4,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  predictionItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  predictionText: {
    fontSize: 14,
    color: '#1F2937',
  },
});

const autocompleteStyles = {
  container: {
    flex: 0,
    width: '100%',
  },
  textInputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  textInput: {
    height: 44,
    color: '#1F2937',
    fontSize: 16,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderColor: '#E5E7EB',
    borderWidth: 1,
  },
  listView: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  row: {
    padding: 13,
    height: 44,
    flexDirection: 'row',
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  description: {
    fontSize: 14,
    color: '#1F2937',
  },
  powered: {
    display: 'none',
  },
};
