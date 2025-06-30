import { MaterialIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import MapView, { MapPressEvent, Marker, Region } from 'react-native-maps';

export function MapSelector({
  region,
  onPress,
  userLocation,
  originCoords,
  destinationCoords,
  driverMarkers,
  style
}: {
  region: Region,
  onPress: (event: MapPressEvent) => void,
  userLocation?: Region | null,
  originCoords?: { latitude: number, longitude: number } | null,
  destinationCoords?: { latitude: number, longitude: number } | null,
  driverMarkers?: Array<{ id: string; location: { latitude: number; longitude: number }; name?: string; car?: { model?: string } }> | null,
  style?: any
}) {
  return (
    <MapView
      style={style}
      region={region}
      onPress={onPress}
    >
      {userLocation && (
        <Marker
          coordinate={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
          }}
          title="Tu ubicación"
          description="Estás aquí"
        />
      )}
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
      {driverMarkers && driverMarkers.map(driver => (
        <Marker
          key={driver.id}
          coordinate={driver.location}
          title={driver.name || 'Conductor disponible'}
          description={driver.car?.model ? `Auto: ${driver.car.model}` : undefined}
        >
          <View style={{
            backgroundColor: '#fff',
            borderRadius: 20,
            borderWidth: 3,
            borderColor: '#2563EB',
            padding: 4,
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 3,
          }}>
            <MaterialIcons name="directions-car" size={24} color="#2563EB" />
          </View>
        </Marker>
      ))}
    </MapView>
  );
} 