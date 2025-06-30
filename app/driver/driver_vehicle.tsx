import { useUser } from '@/contexts/UserContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ImageUpload from '../../src/components/ImageUpload';

export default function DriverVehicleScreen() {
  const router = useRouter();
  const { license, carModel, carColor, carPlate, vehiclePhoto, platePhoto, setUserData } = useUser();

  const [editLicense, setEditLicense] = useState(license || '');
  const [editCarModel, setEditCarModel] = useState(carModel || '');
  const [editCarColor, setEditCarColor] = useState(carColor || '');
  const [editCarPlate, setEditCarPlate] = useState(carPlate || '');
  const [editVehiclePhoto, setEditVehiclePhoto] = useState(vehiclePhoto || '');
  const [editPlatePhoto, setEditPlatePhoto] = useState(platePhoto || '');

  const handleSave = () => {
    if (!editLicense.trim()) {
      Alert.alert('Error', 'La licencia de conducir es obligatoria');
      return;
    }
    
    setUserData({ 
      license: editLicense.trim(),
      carModel: editCarModel.trim(),
      carColor: editCarColor.trim(),
      carPlate: editCarPlate.trim(),
      vehiclePhoto: editVehiclePhoto,
      platePhoto: editPlatePhoto
    });
    Alert.alert('Éxito', 'Información del vehículo actualizada correctamente', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Información del Vehículo</Text>
        <Text style={styles.headerSubtitle}>Gestiona los datos de tu carro</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarBox}>
            <MaterialIcons name="directions-car" size={32} color="#2563EB" />
          </View>
          <Text style={styles.sectionTitle}>Datos del Vehículo</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Licencia de Conducir *</Text>
          <TextInput
            style={styles.input}
            value={editLicense}
            onChangeText={setEditLicense}
            placeholder="Número de licencia"
            placeholderTextColor="#A3A3A3"
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Modelo del Carro</Text>
          <TextInput
            style={styles.input}
            value={editCarModel}
            onChangeText={setEditCarModel}
            placeholder="Ej: Toyota Corolla"
            placeholderTextColor="#A3A3A3"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Color del Carro</Text>
          <TextInput
            style={styles.input}
            value={editCarColor}
            onChangeText={setEditCarColor}
            placeholder="Ej: Blanco"
            placeholderTextColor="#A3A3A3"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Placa del Carro</Text>
          <TextInput
            style={styles.input}
            value={editCarPlate}
            onChangeText={setEditCarPlate}
            placeholder="Ej: ABC-123"
            placeholderTextColor="#A3A3A3"
            autoCapitalize="characters"
          />
        </View>

        <ImageUpload
          title="Foto del Vehículo"
          subtitle="Sube una foto completa de tu carro para verificación"
          currentImage={editVehiclePhoto}
          onImageSelected={setEditVehiclePhoto}
          placeholderIcon="directions-car"
          imageStyle="square"
          uploadType="vehicle"
        />

        <ImageUpload
          title="Foto de la Placa"
          subtitle="Sube una foto clara de la placa del vehículo"
          currentImage={editPlatePhoto}
          onImageSelected={setEditPlatePhoto}
          placeholderIcon="text-fields"
          imageStyle="square"
          uploadType="plate"
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Guardar Cambios</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2563EB',
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
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  profileSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatarBox: {
    backgroundColor: '#F3F4F6',
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
    color: '#1f2937',
  },
  saveButton: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 