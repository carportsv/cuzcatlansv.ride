import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface Marker {
  id: string;
  latitude: number;
  longitude: number;
  title?: string;
  color?: string;
}

interface Polyline {
  id: string;
  coordinates: LocationCoords[];
  color: string;
  width: number;
}

interface OpenStreetMapProps {
  latitude: number;
  longitude: number;
  zoom?: number;
  markers?: Marker[];
  polylines?: Polyline[];
  style?: any;
  onMapPress?: (lat: number, lng: number) => void;
}

export default function OpenStreetMap({
  latitude,
  longitude,
  zoom = 13,
  markers = [],
  polylines = [],
  style,
  onMapPress
}: OpenStreetMapProps) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapText}>🗺️ Mapa</Text>
        <Text style={styles.coordsText}>
          Lat: {latitude.toFixed(4)}, Lng: {longitude.toFixed(4)}
        </Text>
        <Text style={styles.markersText}>
          Marcadores: {markers.length}
        </Text>
        <Text style={styles.polylinesText}>
          Rutas: {polylines.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
  },
  mapText: {
    fontSize: 24,
    marginBottom: 8,
  },
  coordsText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  markersText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  polylinesText: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});