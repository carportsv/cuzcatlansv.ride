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
          name="admin/dashboard" 
          options={{ 
            title: 'Dashboard Admin',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="admin/assign-drivers" 
          options={{ 
            title: 'Asignar Conductores',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="admin/cost-monitoring" 
          options={{ 
            title: 'Monitoreo de Costos',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="driver/driver_availability_content" 
          options={{ 
            title: 'Disponibilidad',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="driver/driver_requests_content" 
          options={{ 
            title: 'Solicitudes',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="driver/driver_accepted_rides" 
          options={{ 
            title: 'Viajes Aceptados',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="driver/driver_history_content" 
          options={{ 
            title: 'Historial',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="testing/solicitar_taxi" 
          options={{ 
            title: 'Solicitar Taxi',
            headerShown: true 
          }} 
        />
        <Stack.Screen 
          name="testing/notifications" 
          options={{ 
            title: 'Notificaciones',
            headerShown: true 
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
