import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { RideRequest } from '@/services/rideService';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function DriverHomeScreen() {
  const [assignedRides, setAssignedRides] = useState<RideRequest[]>([]);
  const [inProgress, setInProgress] = useState<RideRequest[]>([]);
  const router = useRouter();
  const { logout, user } = useAuth();
  const { nick } = useUser();

  useEffect(() => {
    const fetchAssignedRides = async () => {
      // Dummy data temporal hasta que conectes a Firestore o API real
      const rides: RideRequest[] = [];
      setAssignedRides(rides);
    };
    fetchAssignedRides();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // Función para generar un nombre temporal amigable
  const getFriendlyName = () => {
    // Primera prioridad: usar el nick
    if (nick?.trim()) {
      return nick;
    }
    
    // Segunda prioridad: usar el primer nombre
    if (user?.name?.trim()) {
      return user.name.split(' ')[0];
    }
    
    // Tercera prioridad: generar uno basado en el número de teléfono
    if (user?.phoneNumber) {
      const lastDigits = user.phoneNumber.slice(-4);
      return `Conductor ${lastDigits}`;
    }
    
    return 'Amigo';
  };

  const renderRideRequest = ({ item }: { item: RideRequest }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Solicitud: {item.id}</Text>
      <Text style={styles.locationText}>
        Origen: {item.origin.coordinates.latitude}, {item.origin.coordinates.longitude}
      </Text>
      <Text style={styles.locationText}>
        Destino: {item.destination.coordinates.latitude}, {item.destination.coordinates.longitude}
      </Text>
      <Text style={styles.statusText}>Estado: {item.status}</Text>
    </View>
  );

  const menuItems = [
    {
      title: 'Solicitudes',
      subtitle: 'Ver solicitudes de viajes pendientes',
      icon: 'assignment',
      onPress: () => router.push('/driver/driver_requests'),
    },
    {
      title: 'Disponibilidad',
      subtitle: 'Activar o desactivar disponibilidad',
      icon: 'toggle-on',
      onPress: () => router.push('/driver/driver_availability'),
    },
    {
      title: 'Viaje Activo',
      subtitle: 'Gestionar viaje en curso',
      icon: 'directions-car',
      onPress: () => router.push('/driver/driver_ride'),
    },
    {
      title: 'Historial de Viajes',
      subtitle: 'Ver viajes completados',
      icon: 'history',
      onPress: () => router.push('/driver/driver_history'),
    },
    {
      title: 'Configuración',
      subtitle: 'Ajustar preferencias de la app',
      icon: 'settings',
      onPress: () => router.push('/driver/driver_settings'),
    },
    {
      title: 'Cerrar Sesión',
      subtitle: 'Salir de la aplicación',
      icon: 'logout',
      onPress: handleLogout,
      isLogout: true,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Panel de Conductor</Text>
        <Text style={styles.headerSubtitle}>Hola, {getFriendlyName()}</Text>
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {menuItems.map((item, index) => (
          <View key={index} style={styles.optionContainer}>
            <TouchableOpacity
              style={styles.option}
              onPress={item.onPress}
            >
              <View style={styles.optionLeft}>
                <MaterialIcons 
                  name={item.icon as any} 
                  size={24} 
                  color={item.isLogout ? '#E53E3E' : '#2563EB'} 
                />
                <View style={styles.optionText}>
                  <Text style={[
                    styles.optionTitle,
                    item.isLogout && styles.logoutTitle
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={[
                    styles.optionSubtitle,
                    item.isLogout && styles.logoutSubtitle
                  ]}>
                    {item.subtitle}
                  </Text>
                </View>
              </View>
              <MaterialIcons 
                name="chevron-right" 
                size={24} 
                color={item.isLogout ? '#E53E3E' : '#9CA3AF'} 
              />
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
  logoutTitle: {
    color: '#E53E3E',
  },
  logoutSubtitle: {
    color: '#E53E3E',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 14,
    color: '#555555',
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
  },
});
