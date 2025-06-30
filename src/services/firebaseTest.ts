import firestore from '@react-native-firebase/firestore';
import { auth } from './firebaseConfig';

const dbFirestore = firestore();

export const testFirebaseConnection = async () => {
  console.log('=== PRUEBA DE CONECTIVIDAD FIREBASE ===');
  
  try {
    // 1. Verificar que auth esté disponible (simulado)
    console.log('1. Verificando Firebase Auth (simulado)...');
    const authInstance = auth();
    if (!authInstance) {
      throw new Error('Firebase Auth no está disponible');
    }
    console.log('✅ Firebase Auth disponible (simulado)');
    
    // 2. Verificar que db esté disponible
    console.log('2. Verificando Firestore...');
    if (!dbFirestore) {
      throw new Error('Firestore no está inicializado');
    }
    console.log('✅ Firestore disponible');
    
    // 3. Probar acceso a Firestore
    console.log('3. Probando acceso a Firestore...');
    const usersCollection = dbFirestore.collection('users');
    const snapshot = await usersCollection.get();
    console.log('✅ Acceso a Firestore exitoso. Documentos encontrados:', snapshot.size);
    
    // 4. Probar autenticación simulada
    console.log('4. Probando autenticación simulada...');
    const unsubscribe = authInstance.onAuthStateChanged((user: any) => {
      if (user) {
        console.log('✅ Usuario autenticado (simulado):', user.uid);
      } else {
        console.log('ℹ️ Usuario no autenticado (simulado)');
      }
    });
    
    // Limpiar listener después de 3 segundos
    setTimeout(() => {
      unsubscribe();
      console.log('✅ Listener de autenticación limpiado');
    }, 3000);
    
    console.log('=== PRUEBA COMPLETADA EXITOSAMENTE ===');
    return true;
    
  } catch (error) {
    console.error('❌ Error en prueba de Firebase:', error);
    return false;
  }
};

export const getFirebaseStatus = () => {
  try {
    const authInstance = auth();
    return {
      auth: !!authInstance,
      db: !!dbFirestore,
      authCurrentUser: authInstance?.currentUser,
      authConfig: 'simulado',
      isSimulated: true
    };
  } catch (error) {
    return {
      auth: false,
      db: !!dbFirestore,
      authCurrentUser: null,
      authConfig: null,
      error: error,
      isSimulated: false
    };
  }
};

// Función de prueba para crear una solicitud de viaje
export const testCreateRideRequest = async () => {
  try {
    console.log('🧪 Iniciando prueba de creación de solicitud de viaje...');
    
    const testRideRequest = {
      userId: 'test-user-id',
      driverId: 'test-driver-id',
      origin: {
        address: 'Test Origin',
        coordinates: {
          latitude: 13.6929403,
          longitude: -89.2181911
        }
      },
      destination: {
        address: 'Test Destination',
        coordinates: {
          latitude: 13.6929403 + 0.01,
          longitude: -89.2181911 + 0.01
        }
      },
      status: 'requested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('📝 Datos de prueba:', JSON.stringify(testRideRequest, null, 2));
    
    const docRef = await dbFirestore.collection('rideRequests').add(testRideRequest);
    console.log('✅ Prueba exitosa - Documento creado con ID:', docRef.id);
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Error en prueba de creación:', error);
    console.error('Stack trace:', (error as Error).stack);
    return { success: false, error: error };
  }
}; 