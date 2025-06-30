import { useAuth } from '@/contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

export default function DriverSettings() {
  const { user } = useAuth();
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar Sesión', style: 'destructive', onPress: () => router.replace('/login') }
      ]
    );
  };

  const settingsOptions = [
    {
      title: 'Notificaciones',
      subtitle: 'Recibir notificaciones de viajes',
      icon: 'notifications',
      type: 'switch',
      value: notificationsEnabled,
      onValueChange: setNotificationsEnabled,
    },
    {
      title: 'Editar Perfil',
      subtitle: 'Modificar información personal',
      icon: 'person',
      type: 'navigate',
      onPress: () => router.push('/driver/driver_profile'),
    },
    {
      title: 'Información del Vehículo',
      subtitle: 'Gestionar datos del carro',
      icon: 'directions-car',
      type: 'navigate',
      onPress: () => router.push('/driver/driver_vehicle'),
    },
    {
      title: 'Ayuda y Soporte',
      subtitle: 'Contactar soporte técnico',
      icon: 'help',
      type: 'navigate',
      onPress: () => Alert.alert('Soporte', 'Función en desarrollo'),
    },
    {
      title: 'Acerca de',
      subtitle: 'Información de la aplicación',
      icon: 'info',
      type: 'navigate',
      onPress: () => Alert.alert('Acerca de', 'Taxi ZKT v1.0.0'),
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Configuración</Text>
        <Text style={styles.headerSubtitle}>Ajusta tus preferencias</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {settingsOptions.map((option, index) => (
          <View key={index} style={styles.optionContainer}>
            <TouchableOpacity
              style={styles.option}
              onPress={option.type === 'navigate' ? option.onPress : undefined}
              disabled={option.type === 'switch'}
            >
              <View style={styles.optionLeft}>
                <MaterialIcons name={option.icon as any} size={24} color="#2563EB" />
                <View style={styles.optionText}>
                  <Text style={styles.optionTitle}>{option.title}</Text>
                  <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
                </View>
              </View>
              {option.type === 'switch' ? (
                <Switch
                  value={option.value}
                  onValueChange={option.onValueChange}
                  trackColor={{ false: '#767577', true: '#2563EB' }}
                  thumbColor={option.value ? '#fff' : '#f4f3f4'}
                />
              ) : (
                <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
              )}
            </TouchableOpacity>
          </View>
        ))}
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
    paddingBottom: 20,
  },
  optionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  optionText: {
    marginLeft: 16,
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
}); 