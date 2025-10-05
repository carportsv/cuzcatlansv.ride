import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './contexts/AuthContext';

export default function RootLayout() {

  return (
    <AuthProvider>
      <StatusBar style="light" backgroundColor="#2563EB" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#2563EB',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="(tabs)" 
          options={{ 
            title: 'TaxiApp',
            headerShown: false 
          }} 
        />
        <Stack.Screen 
          name="diagnostic" 
          options={{ 
            title: 'Diagnóstico',
            headerShown: true 
          }} 
        />
      </Stack>
    </AuthProvider>
  );
}
