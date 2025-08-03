# Uso de OpenStreetMap en el Proyecto

Este proyecto utiliza **OpenStreetMap** y servicios gratuitos para mapas, geocodificación y rutas, en lugar de Google Maps para reducir costos.

## Componentes Disponibles

### 1. OpenStreetMap Component

Componente principal para mostrar mapas usando OpenStreetMap con Leaflet.

```tsx
import OpenStreetMap from '@/components/OpenStreetMap';

// Uso básico
<OpenStreetMap
  latitude={13.7942}
  longitude={-88.8965}
  zoom={15}
  markers={[
    {
      id: '1',
      latitude: 13.7942,
      longitude: -88.8965,
      title: 'Mi ubicación',
      color: '#ff0000'
    }
  ]}
  onMarkerPress={(markerId) => console.log('Marcador presionado:', markerId)}
  onMapPress={(lat, lng) => console.log('Mapa presionado:', lat, lng)}
  showUserLocation={true}
  userLocation={{ latitude: 13.7942, longitude: -88.8965 }}
/>
```

### 2. OpenStreetPlacesAutocomplete

Componente para autocompletado de direcciones usando Nominatim.

```tsx
import OpenStreetPlacesAutocomplete from '@/components/OpenStreetPlacesAutocomplete';

<OpenStreetPlacesAutocomplete
  placeholder="Buscar dirección..."
  onPlaceSelected={(place) => {
    console.log('Lugar seleccionado:', place);
    // place.lat, place.lon, place.display_name
  }}
  onTextChange={(text) => console.log('Texto cambiado:', text)}
/>
```

## Servicios Disponibles

### OpenStreetMapService

```tsx
import openStreetMapService from '@/services/openStreetMapService';

// Geocodificación: dirección a coordenadas
const coords = await openStreetMapService.geocode('San Salvador, El Salvador');

// Geocodificación inversa: coordenadas a dirección
const address = await openStreetMapService.reverseGeocode(13.7942, -88.8965);

// Buscar lugares
const places = await openStreetMapService.searchPlaces('San Salvador');

// Obtener ruta entre dos puntos
const route = await openStreetMapService.getRoute(
  { latitude: 13.7942, longitude: -88.8965 },
  { latitude: 13.7945, longitude: -88.8970 },
  'driving' // 'driving', 'walking', 'cycling'
);

// Calcular distancia
const distance = openStreetMapService.calculateDistance(
  { latitude: 13.7942, longitude: -88.8965 },
  { latitude: 13.7945, longitude: -88.8970 }
);

// Formatear distancia y duración
const formattedDistance = openStreetMapService.formatDistance(1500); // "1.5km"
const formattedDuration = openStreetMapService.formatDuration(3660); // "1h 1m"
```

## Servicios Utilizados

### 1. OpenStreetMap Tiles
- **URL**: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png`
- **Costo**: Gratuito
- **Límites**: Uso comercial permitido con atribución

### 2. Nominatim (Geocodificación)
- **URL**: `https://nominatim.openstreetmap.org`
- **Costo**: Gratuito
- **Límites**: 1 petición por segundo, uso comercial permitido

### 3. OSRM (Rutas)
- **URL**: `https://router.project-osrm.org`
- **Costo**: Gratuito
- **Límites**: Uso comercial permitido

## Ventajas vs Google Maps

### ✅ Ventajas de OpenStreetMap
- **Gratuito**: Sin costos de API
- **Sin límites estrictos**: Solo límites de rate
- **Datos abiertos**: Comunidad global
- **Sin dependencia**: No requiere API keys

### ⚠️ Consideraciones
- **Calidad de datos**: Puede variar por región
- **Geocodificación**: Menos precisa que Google
- **Rutas**: Algoritmos diferentes
- **UI**: Requiere más personalización

## Migración desde Google Maps

### Reemplazos Directos

| Google Maps | OpenStreetMap |
|-------------|---------------|
| `react-native-maps` | `OpenStreetMap` (WebView + Leaflet) |
| `react-native-google-places-autocomplete` | `OpenStreetPlacesAutocomplete` |
| `react-native-maps-directions` | `openStreetMapService.getRoute()` |
| `react-native-geocoding` | `openStreetMapService.geocode()` |

### Ejemplo de Migración

```tsx
// ANTES (Google Maps)
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

<MapView
  initialRegion={{
    latitude: 13.7942,
    longitude: -88.8965,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  }}
>
  <Marker coordinate={{ latitude: 13.7942, longitude: -88.8965 }} />
</MapView>

// DESPUÉS (OpenStreetMap)
import OpenStreetMap from '@/components/OpenStreetMap';

<OpenStreetMap
  latitude={13.7942}
  longitude={-88.8965}
  zoom={15}
  markers={[
    {
      id: '1',
      latitude: 13.7942,
      longitude: -88.8965,
      title: 'Mi ubicación'
    }
  ]}
/>
```

## Configuración del Proyecto

### Dependencias Instaladas
- `react-native-webview`: Para mostrar mapas web
- `react-native-leaflet`: Alternativa (no usada en este proyecto)
- `react-native-geolocation-service`: Para ubicación del usuario

### Configuración Removida
- Google Maps API Key
- Google Places API
- Google Directions API

## Notas Importantes

1. **Autenticación**: Se mantiene Google Auth para login/registro
2. **Ubicación**: Se usa `expo-location` para obtener ubicación del usuario
3. **Offline**: Los mapas requieren conexión a internet
4. **Performance**: WebView puede ser más lento que mapas nativos
5. **Personalización**: Requiere CSS/HTML para personalizar marcadores

## Troubleshooting

### Problemas Comunes

1. **Mapa no carga**: Verificar conexión a internet
2. **Geocodificación lenta**: Implementar debounce en búsquedas
3. **Rutas no encontradas**: Verificar formato de coordenadas
4. **WebView blanco**: Verificar permisos de internet en Android

### Logs Útiles

```tsx
// Habilitar logs del servicio
console.log('Geocoding result:', await openStreetMapService.geocode('San Salvador'));
console.log('Route result:', await openStreetMapService.getRoute(origin, destination));
``` 