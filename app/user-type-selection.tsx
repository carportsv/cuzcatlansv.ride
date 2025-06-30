import { useRouter } from 'expo-router';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';

export default function UserTypeSelection() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const handleRegister = (userType: 'user' | 'driver' | 'admin') => {
    router.push(`/register/${userType}`);
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const UserTypeCard = ({ 
    title, 
    description, 
    icon, 
    userType
  }: {
    title: string;
    description: string;
    icon: string;
    userType: 'user' | 'driver';
  }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.7}
      onPress={() => handleRegister(userType)}
    >
      <View style={styles.cardContent}>
        <Text style={styles.cardIcon}>{icon}</Text>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a1a2e" />
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>cuzcatlansv.ride</Text>
          <Text style={styles.subtitle}>Selecciona tu tipo de cuenta</Text>
        </View>

        <View style={styles.cardsContainer}>
          <UserTypeCard
            title="Usuario"
            description="Solicita viajes y disfruta de un transporte seguro y confiable"
            icon="👤"
            userType="user"
          />

          <UserTypeCard
            title="Conductor"
            description="Ofrece servicios de transporte y gana dinero con tu vehículo"
            icon="🚗"
            userType="driver"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 32,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#11181C',
    textAlign: 'center',
  },
  cardsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    gap: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2563EB',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardContent: {
    alignItems: 'center',
  },
  cardIcon: {
    fontSize: 38,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2563EB',
    marginBottom: 5,
    textAlign: 'center',
  },
  cardDescription: {
    fontSize: 13,
    color: '#11181C',
    textAlign: 'center',
    marginBottom: 14,
    lineHeight: 18,
  },
  registerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
  },
  registerButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    padding: 18,
    alignItems: 'center',
  },
  footerText: {
    color: '#a0a0a0',
    fontSize: 15,
    marginBottom: 10,
  },
  loginButton: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 20,
  },
  loginButtonText: {
    color: '#1a1a2e',
    fontSize: 15,
    fontWeight: 'bold',
  },
}); 