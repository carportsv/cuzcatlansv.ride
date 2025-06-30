import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DriverVerificationScreen() {
  const router = useRouter();
  const { driverId } = useLocalSearchParams();
  
  // En una implementación real, obtendrías los datos del conductor desde Firebase
  // Por ahora usamos datos de ejemplo
  const driverData = {
    name: 'Carlos Alfredo Portillo Ayala',
    license: 'ABC-123456',
    carModel: 'Toyota Corolla',
    carColor: 'Blanco',
    carPlate: 'ABC-123',
    driverPhoto: 'https://example.com/driver-photo.jpg',
    vehiclePhoto: 'https://example.com/vehicle-photo.jpg',
    platePhoto: 'https://example.com/plate-photo.jpg',
    rating: 4.8,
    trips: 127,
  };

  const handleConfirmRide = () => {
    // Aquí iría la lógica para confirmar el viaje
    router.push('/user/user_ride');
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verificación del Conductor</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.driverInfoCard}>
          <View style={styles.driverHeader}>
            <View style={styles.avatarContainer}>
              {driverData.driverPhoto ? (
                <Image source={{ uri: driverData.driverPhoto }} style={styles.driverAvatar} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialIcons name="person" size={32} color="#9CA3AF" />
                </View>
              )}
            </View>
            <View style={styles.driverDetails}>
              <Text style={styles.driverName}>{driverData.name}</Text>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={16} color="#F59E0B" />
                <Text style={styles.ratingText}>{driverData.rating}</Text>
                <Text style={styles.tripsText}>• {driverData.trips} viajes</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.verificationSection}>
          <Text style={styles.sectionTitle}>Verificación de Seguridad</Text>
          <Text style={styles.sectionSubtitle}>
            Confirma que la información coincide con tu conductor
          </Text>
        </View>

        <View style={styles.photoCard}>
          <Text style={styles.photoTitle}>Foto del Conductor</Text>
          <View style={styles.photoContainer}>
            {driverData.driverPhoto ? (
              <Image source={{ uri: driverData.driverPhoto }} style={styles.verificationPhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialIcons name="person" size={48} color="#9CA3AF" />
                <Text style={styles.photoPlaceholderText}>Foto no disponible</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.photoCard}>
          <Text style={styles.photoTitle}>Foto del Vehículo</Text>
          <View style={styles.photoContainer}>
            {driverData.vehiclePhoto ? (
              <Image source={{ uri: driverData.vehiclePhoto }} style={styles.verificationPhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialIcons name="directions-car" size={48} color="#9CA3AF" />
                <Text style={styles.photoPlaceholderText}>Foto no disponible</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.photoCard}>
          <Text style={styles.photoTitle}>Foto de la Placa</Text>
          <View style={styles.photoContainer}>
            {driverData.platePhoto ? (
              <Image source={{ uri: driverData.platePhoto }} style={styles.verificationPhoto} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <MaterialIcons name="text-fields" size={48} color="#9CA3AF" />
                <Text style={styles.photoPlaceholderText}>Foto no disponible</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.vehicleInfoCard}>
          <Text style={styles.vehicleInfoTitle}>Información del Vehículo</Text>
          <View style={styles.vehicleInfoRow}>
            <Text style={styles.vehicleInfoLabel}>Modelo:</Text>
            <Text style={styles.vehicleInfoValue}>{driverData.carModel}</Text>
          </View>
          <View style={styles.vehicleInfoRow}>
            <Text style={styles.vehicleInfoLabel}>Color:</Text>
            <Text style={styles.vehicleInfoValue}>{driverData.carColor}</Text>
          </View>
          <View style={styles.vehicleInfoRow}>
            <Text style={styles.vehicleInfoLabel}>Placa:</Text>
            <Text style={styles.vehicleInfoValue}>{driverData.carPlate}</Text>
          </View>
          <View style={styles.vehicleInfoRow}>
            <Text style={styles.vehicleInfoLabel}>Licencia:</Text>
            <Text style={styles.vehicleInfoValue}>{driverData.license}</Text>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.confirmButton} onPress={handleConfirmRide}>
            <MaterialIcons name="check-circle" size={20} color="#fff" />
            <Text style={styles.confirmButtonText}>Confirmar Viaje</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
            <MaterialIcons name="cancel" size={20} color="#EF4444" />
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: '#2563EB',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  driverInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  driverHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 16,
  },
  driverAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F59E0B',
    marginLeft: 4,
  },
  tripsText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  verificationSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  photoCard: {
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
  photoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  photoContainer: {
    alignItems: 'center',
  },
  verificationPhoto: {
    width: 200,
    height: 150,
    borderRadius: 8,
  },
  photoPlaceholder: {
    width: 200,
    height: 150,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 8,
  },
  vehicleInfoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  vehicleInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  vehicleInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  vehicleInfoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  vehicleInfoValue: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '600',
  },
  buttonContainer: {
    gap: 12,
  },
  confirmButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EF4444',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
}); 