import { AuthProvider } from '@/contexts/AuthContext';
import { UserProvider } from '@/contexts/UserContext';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import SplashVideo from './components/SplashVideo';

// Mantener la splash screen visible mientras se carga la app
SplashScreen.preventAutoHideAsync();

function RootLayout() {
  const colorScheme = useColorScheme();
  const [appIsReady, setAppIsReady] = useState(false);
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    async function prepare() {
      try {
        // Simular tiempo de carga para mostrar el video
        await new Promise(resolve => setTimeout(resolve, 3000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  const handleVideoEnd = () => {
    setShowVideo(false);
    SplashScreen.hideAsync();
  };

  if (showVideo) {
    return <SplashVideo onVideoEnd={handleVideoEnd} />;
  }

  if (!appIsReady) {
    return null; // Mantener la splash screen visible
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <UserProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="user-type-selection" />
              <Stack.Screen name="login" />
              <Stack.Screen name="register/user" />
              <Stack.Screen name="register/driver" />
              <Stack.Screen name="register/admin" />
              <Stack.Screen name="driver/driver_availability" />
              <Stack.Screen name="driver/driver_ride" />
              <Stack.Screen name="driver/driver_home" />
              <Stack.Screen name="driver/driver_requests" />
              <Stack.Screen name="driver/driver_settings" />
              <Stack.Screen name="driver/driver_profile" />
              <Stack.Screen name="driver/driver_history" />
              <Stack.Screen name="user/user_active_ride" />
              <Stack.Screen name="user/user_drivers" />
              <Stack.Screen name="user/user_history" />
              <Stack.Screen name="user/user_ride_summary" />
              <Stack.Screen name="user/user_home" />
              <Stack.Screen name="user/user_ride" />
              <Stack.Screen name="user/user_settings" />
              <Stack.Screen name="user/user_sett_add_home" />
              <Stack.Screen name="user/user_sett_add_work" />
              <Stack.Screen name="user/user_sett_perfil" />
              <Stack.Screen name="user/user_sett_perfil_edit" />
              <Stack.Screen name="user/user_sett_direcciones" />
              <Stack.Screen name="user/user_about" />
              <Stack.Screen name="admin/admin_home" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </UserProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayout;
