import { useAuth } from '@/contexts/AuthContext';
import { useUser } from '@/contexts/UserContext';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserHome() {
  const router = useRouter();
  const { logout, user } = useAuth();
  const { nick } = useUser();
  const [hasActiveRide, setHasActiveRide] = useState(false);
  const [activeRideId, setActiveRideId] = useState<string | null>(null);

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
      return `Usuario ${lastDigits}`;
    }
    
    return 'Amigo';
  };

  // Verificar si hay un viaje activo
  useEffect(() => {
    const checkActiveRide = async () => {
      try {
        const userId = await AsyncStorage.getItem('userUID');
        if (!userId) return;

        const q = firestore().collection('rideRequests').where('userId', '==', userId).where('status', 'in', ['accepted', 'in_progress']);

        const unsubscribe = q.onSnapshot((querySnapshot) => {
          const hasActive = !querySnapshot.empty;
          setHasActiveRide(hasActive);
          if (hasActive) {
            setActiveRideId(querySnapshot.docs[0].id);
          } else {
            setActiveRideId(null);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Error checking active ride:', error);
      }
    };

    checkActiveRide();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleActiveRide = async () => {
    if (activeRideId) {
      router.push({ pathname: '/user/user_active_ride', params: { rideId: activeRideId } });
    } else {
      Alert.alert('Sin viaje activo', 'No tienes un viaje activo en este momento.');
    }
  };

  const menuItems = [
    {
      title: 'Solicitar Taxi',
      subtitle: 'Pedir un taxi a tu ubicación',
      icon: 'local-taxi' as const,
      onPress: () => router.push('/user/user_ride'),
    },
    ...(hasActiveRide ? [{
      title: 'Viaje Activo',
      subtitle: 'Ver estado de tu viaje actual',
      icon: 'directions-car' as const,
      onPress: handleActiveRide,
    }] : []),
    {
      title: 'Historial de Viajes',
      subtitle: 'Ver viajes anteriores',
      icon: 'history' as const,
      onPress: () => router.push('/user/user_history'),
    },
    {
      title: 'Configuración',
      subtitle: 'Ajustar preferencias de la app',
      icon: 'settings' as const,
      onPress: () => router.push('/user/user_settings'),
    },
    {
      title: 'Cerrar Sesión',
      subtitle: 'Salir de la aplicación',
      icon: 'logout' as const,
      onPress: handleLogout,
      isLogout: true,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>cuzcatlansv.ride</Text>
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
                  name={item.icon} 
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
    fontFamily: 'Poppins',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    marginTop: 5,
    fontFamily: 'Poppins',
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
    fontFamily: 'Poppins',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
    fontFamily: 'Poppins',
  },
  logoutTitle: {
    color: '#E53E3E',
  },
  logoutSubtitle: {
    color: '#E53E3E',
  },
}); 