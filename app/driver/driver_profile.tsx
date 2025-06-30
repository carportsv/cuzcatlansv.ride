import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ImageUpload from '../../src/components/ImageUpload';

export default function DriverProfile() {
  const router = useRouter();
  const { user } = useAuth();
  const { name, phone, email, nick, driverPhoto, setUserData } = useUser();

  // Separar nombre y apellido del nombre completo
  const nameParts = name ? name.split(' ') : ['', ''];
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [editPhone, setEditPhone] = useState(phone);
  const [editEmail, setEditEmail] = useState(email);
  const [editNick, setEditNick] = useState(nick || '');
  const [editDriverPhoto, setEditDriverPhoto] = useState(driverPhoto || '');

  const handleSave = () => {
    if (!firstName.trim()) {
      Alert.alert('Error', 'El nombre es obligatorio');
      return;
    }
    
    const fullName = lastName.trim() ? `${firstName.trim()} ${lastName.trim()}` : firstName.trim();
    setUserData({ 
      name: fullName, 
      phone: editPhone, 
      email: editEmail,
      nick: editNick.trim() || firstName.trim(),
      driverPhoto: editDriverPhoto
    });
    Alert.alert('Éxito', 'Perfil actualizado correctamente', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Perfil del Conductor</Text>
        <Text style={styles.headerSubtitle}>Gestiona tu información personal</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileSection}>
          <View style={styles.avatarBox}>
            <MaterialIcons name="person" size={32} color="#2563EB" />
          </View>
          <Text style={styles.sectionTitle}>Información Personal</Text>
        </View>

        <ImageUpload
          title="Foto del Conductor"
          subtitle="Sube una foto clara de tu rostro para mayor seguridad"
          currentImage={editDriverPhoto}
          onImageSelected={setEditDriverPhoto}
          placeholderIcon="person"
          imageStyle="round"
          uploadType="driver"
        />

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Tu nombre"
            placeholderTextColor="#A3A3A3"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Apellido</Text>
          <TextInput
            style={styles.input}
            value={lastName}
            onChangeText={setLastName}
            placeholder="Tu apellido"
            placeholderTextColor="#A3A3A3"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Nick</Text>
          <TextInput
            style={styles.input}
            value={editNick}
            onChangeText={setEditNick}
            placeholder="Tu nick"
            placeholderTextColor="#A3A3A3"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={editPhone}
            onChangeText={setEditPhone}
            placeholder="Tu número de teléfono"
            placeholderTextColor="#A3A3A3"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Correo Electrónico</Text>
          <TextInput
            style={styles.input}
            value={editEmail}
            onChangeText={setEditEmail}
            placeholder="tu@email.com"
            placeholderTextColor="#A3A3A3"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

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