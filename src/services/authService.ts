import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from './firebaseConfig';
import { getUserRoleFromFirestore, saveUserData } from './userFirestore';

export interface UserSession {
  uid: string;
  role: string;
  phoneNumber: string;
  name?: string;
  email?: string;
}

export class AuthService {
  // Enviar código de verificación
  static async sendVerificationCode(phoneNumber: string) {
    try {
      console.log('AuthService: Enviando código a:', phoneNumber);
      const authInstance = auth();
      const confirmation = await authInstance.signInWithPhoneNumber(phoneNumber);
      console.log('AuthService: Código enviado exitosamente');
      return confirmation;
    } catch (error) {
      console.error('AuthService: Error enviando código:', error);
      throw error;
    }
  }

  // Verificar código y autenticar usuario
  static async verifyCodeAndSignIn(confirmation: any, code: string) {
    try {
      console.log('AuthService: Verificando código...');
      const result = await confirmation.confirm(code);
      console.log('AuthService: Código verificado exitosamente');
      return result.user;
    } catch (error) {
      console.error('AuthService: Error verificando código:', error);
      throw error;
    }
  }

  // Guardar sesión del usuario
  static async saveUserSession(user: any, phoneNumber: string) {
    try {
      console.log('AuthService: Guardando sesión para usuario:', user.uid);
      
      // Obtener rol del usuario desde Firestore
      const role = await getUserRoleFromFirestore(user.uid);
      
      // Crear objeto de sesión
      const session: UserSession = {
        uid: user.uid,
        role: role || 'user',
        phoneNumber: phoneNumber,
        name: user.displayName || '',
        email: user.email || ''
      };

      // Guardar en AsyncStorage
      await AsyncStorage.setItem('userSession', JSON.stringify(session));
      await AsyncStorage.setItem('userUID', user.uid);
      await AsyncStorage.setItem('userRole', session.role);
      
      console.log('AuthService: Sesión guardada exitosamente');
      return session;
    } catch (error) {
      console.error('AuthService: Error guardando sesión:', error);
      throw error;
    }
  }

  // Obtener sesión actual del usuario
  static async getCurrentSession(): Promise<UserSession | null> {
    try {
      const sessionData = await AsyncStorage.getItem('userSession');
      if (sessionData) {
        const session: UserSession = JSON.parse(sessionData);
        console.log('AuthService: Sesión recuperada:', session.uid);
        return session;
      }
      return null;
    } catch (error) {
      console.error('AuthService: Error obteniendo sesión:', error);
      return null;
    }
  }

  // Verificar si el usuario está autenticado
  static async isAuthenticated(): Promise<boolean> {
    try {
      const session = await this.getCurrentSession();
      const authInstance = auth();
      const currentUser = authInstance.currentUser;
      
      return !!(session && currentUser);
    } catch (error) {
      console.error('AuthService: Error verificando autenticación:', error);
      return false;
    }
  }

  // Cerrar sesión
  static async signOut() {
    try {
      console.log('AuthService: Cerrando sesión...');
      const authInstance = auth();
      await authInstance.signOut();
      
      // Limpiar AsyncStorage
      await AsyncStorage.removeItem('userSession');
      await AsyncStorage.removeItem('userUID');
      await AsyncStorage.removeItem('userRole');
      
      console.log('AuthService: Sesión cerrada exitosamente');
    } catch (error) {
      console.error('AuthService: Error cerrando sesión:', error);
      throw error;
    }
  }

  // Crear o actualizar perfil de usuario
  static async createOrUpdateUserProfile(userData: {
    uid: string;
    name: string;
    phoneNumber: string;
    role: string;
    email?: string;
  }) {
    try {
      console.log('AuthService: Creando/actualizando perfil para:', userData.uid);
      
      // Guardar en Firestore
      await saveUserData(userData.uid, {
        name: userData.name,
        phoneNumber: userData.phoneNumber,
        role: userData.role,
        email: userData.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Actualizar sesión local
      const session: UserSession = {
        uid: userData.uid,
        role: userData.role,
        phoneNumber: userData.phoneNumber,
        name: userData.name,
        email: userData.email
      };

      await AsyncStorage.setItem('userSession', JSON.stringify(session));
      
      console.log('AuthService: Perfil creado/actualizado exitosamente');
      return session;
    } catch (error) {
      console.error('AuthService: Error creando/actualizando perfil:', error);
      throw error;
    }
  }
} 