import PlaceInput from '@/components/PlaceInput';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function GoogleTestScreen() {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // Diferentes keys para probar
  const ENV_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
  const HARDCODED_KEY = 'AIzaSyBW7YFauqJBbv6Xm8a1tsDLGVDzF6rXHhI';
  const TEST_KEY = 'AIzaSyCQJjHqjHqjHqjHqjHqjHqjHqjHqjHqjHqj'; // Key de ejemplo

  console.log('🔍 GoogleTestScreen - Iniciando...');
  console.log('🔍 ENV_API_KEY:', ENV_API_KEY);
  console.log('🔍 HARDCODED_KEY:', HARDCODED_KEY);

  const handleOriginPress = (data: any, details: any = null) => {
    console.log('🔍 Origen seleccionado:', data);
    setOrigin(data.description);
    Alert.alert('Éxito', `Origen seleccionado: ${data.description}`);
  };

  const handleDestinationPress = (data: any, details: any = null) => {
    console.log('🔍 Destino seleccionado:', data);
    setDestination(data.description);
    Alert.alert('Éxito', `Destino seleccionado: ${data.description}`);
  };

  const handleError = (error: any) => {
    console.error('❌ Error en GooglePlacesAutocomplete:', error);
    Alert.alert('Error', `Error en Google Places: ${JSON.stringify(error)}`);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>🔍 Prueba de Google Places</Text>
      
      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Configuración:</Text>
        <Text style={styles.infoText}>• ENV API Key: {ENV_API_KEY ? '✅ Presente' : '❌ Ausente'}</Text>
        <Text style={styles.infoText}>• Hardcoded Key: {HARDCODED_KEY ? '✅ Presente' : '❌ Ausente'}</Text>
      </View>

      {/* GooglePlacesAutocomplete con key del .env */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>1. GooglePlacesAutocomplete (ENV Key):</Text>
        <GooglePlacesAutocomplete
          placeholder="Buscar con ENV key..."
          minLength={2}
          fetchDetails={true}
          onPress={handleOriginPress}
          query={{
            key: ENV_API_KEY || '',
            language: 'es'
          }}
          styles={{
            container: styles.googleContainer,
            textInput: styles.googleInput,
          }}
          enablePoweredByContainer={false}
        />
        <Text style={styles.value}>Origen: {origin}</Text>
      </View>

      {/* GooglePlacesAutocomplete con key hardcodeada */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>2. GooglePlacesAutocomplete (Hardcoded Key):</Text>
        <GooglePlacesAutocomplete
          placeholder="Buscar con hardcoded key..."
          minLength={2}
          fetchDetails={true}
          onPress={(data) => {
            console.log('🔍 Hardcoded key seleccionado:', data);
            setDestination(data.description);
          }}
          query={{
            key: HARDCODED_KEY,
            language: 'es'
          }}
          styles={{
            container: styles.googleContainer,
            textInput: styles.googleInput,
          }}
          enablePoweredByContainer={false}
        />
        <Text style={styles.value}>Destino: {destination}</Text>
      </View>

      {/* PlaceInput component */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>3. PlaceInput Component:</Text>
        <PlaceInput
          placeholder="Buscar con PlaceInput..."
          onPress={handleDestinationPress}
          styles={{
            container: styles.googleContainer,
            textInput: styles.googleInput,
          }}
        />
      </View>

      {/* GooglePlacesAutocomplete con key de prueba */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>4. GooglePlacesAutocomplete (Test Key):</Text>
        <GooglePlacesAutocomplete
          placeholder="Buscar con test key..."
          minLength={2}
          fetchDetails={true}
          onPress={(data) => console.log('🔍 Test key seleccionado:', data)}
          query={{
            key: TEST_KEY,
            language: 'es'
          }}
          styles={{
            container: styles.googleContainer,
            textInput: styles.googleInput,
          }}
          enablePoweredByContainer={false}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoTitle}>Instrucciones:</Text>
        <Text style={styles.infoText}>• Prueba cada input por separado</Text>
        <Text style={styles.infoText}>• Revisa la consola para errores</Text>
        <Text style={styles.infoText}>• Si uno funciona, el problema es la key</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 25,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  googleContainer: {
    flex: 0,
  },
  googleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  value: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  infoContainer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#2196f3',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#424242',
    marginBottom: 4,
  },
}); 