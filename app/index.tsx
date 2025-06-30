import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Usuario autenticado - redirigir según su rol
        if (user.role === 'admin') {
          router.replace('/admin/admin_home');
        } else if (user.role === 'driver') {
          router.replace('/driver/driver_home');
        } else {
          router.replace('/user/user_home');
        }
      } else {
        // Usuario no autenticado - ir a selección de tipo de usuario
        router.replace('/user-type-selection');
      }
    }
  }, [isAuthenticated, user, loading, router]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return null; // No renderizar nada mientras se redirige
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
}); 