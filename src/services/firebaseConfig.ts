import firebaseApp from '@react-native-firebase/app';
import firebaseAuth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Verificar variables de entorno
console.log('FirebaseConfig: Verificando variables de entorno...');
console.log('FirebaseConfig: EXPO_PUBLIC_FIREBASE_API_KEY:', process.env.EXPO_PUBLIC_FIREBASE_API_KEY ? '✅ Presente' : '❌ Ausente');
console.log('FirebaseConfig: EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN:', process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Presente' : '❌ Ausente');
console.log('FirebaseConfig: EXPO_PUBLIC_FIREBASE_PROJECT_ID:', process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Presente' : '❌ Ausente');

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || "AIzaSyAJfonmq_9roRuSP3y9UXXEJHRxD3DhcNQ",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "taxi-zkt-7f276.firebaseapp.com",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || "taxi-zkt-7f276",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "taxi-zkt-7f276.appspot.com",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "570692523770",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || "1:570692523770:android:26e5ad5e0c0ded43331b43",
  clientId: "570692523770-9a0na4dlo6rej39t0ahp3vki6cvqq95g.apps.googleusercontent.com",
  certificateHash: "1756ccff528d591c7b0a186b3f747ec49c072bd4"
};

// Validar configuración de Firebase
const validateFirebaseConfig = () => {
  const requiredFields = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingFields = requiredFields.filter(field => !firebaseConfig[field as keyof typeof firebaseConfig]);
  
  if (missingFields.length > 0) {
    console.error('FirebaseConfig: Campos faltantes:', missingFields);
    throw new Error(`Configuración de Firebase incompleta. Campos faltantes: ${missingFields.join(', ')}`);
  }
  
  console.log('FirebaseConfig: Configuración válida ✅');
  console.log('FirebaseConfig: Project ID:', firebaseConfig.projectId);
  console.log('FirebaseConfig: Auth Domain:', firebaseConfig.authDomain);
  console.log('FirebaseConfig: API Key (primeros 10 chars):', firebaseConfig.apiKey.substring(0, 10) + '...');
  console.log('FirebaseConfig: Storage Bucket:', firebaseConfig.storageBucket);
};

console.log('FirebaseConfig: Inicializando Firebase...');
console.log('FirebaseConfig: Apps existentes:', firebaseApp.apps.length);

// Validar configuración antes de inicializar
validateFirebaseConfig();

// Inicializar Firebase solo si no hay una instancia existente
if (firebaseApp.apps.length === 0) {
  firebaseApp.initializeApp(firebaseConfig);
}
const app = firebaseApp.app();

console.log('FirebaseConfig: App inicializada');

// Inicializar Firestore
const db = firestore();

console.log('FirebaseConfig: Firestore inicializado');

// Función para obtener auth real
export const getAuthInstance = (): any => {
  console.log('FirebaseConfig: Usando autenticación real de React Native Firebase');
  return firebaseAuth();
};

// Exportar auth como función para inicialización diferida
export const auth = (): any => getAuthInstance();

export { app, db };

