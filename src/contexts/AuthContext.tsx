import { AuthService, UserSession } from '@/services/authService';
import { testEnvVariables } from '@/services/envTest';
import { auth } from '@/services/firebaseConfig';
import { testFirebaseConnection } from '@/services/firebaseTest';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define el tipo para el contexto de autenticación
interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  user: UserSession | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (phoneNumber: string) => Promise<any>;
  verifyCode: (confirmation: any, code: string) => Promise<void>;
}

// Crea el contexto con valores predeterminados
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
  user: null,
  loading: true,
  logout: async () => {},
  login: async () => {},
  verifyCode: async () => {}
});

// Proveedor del contexto
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('AuthProvider: Inicializando Firebase Auth...');
    
    // Ejecutar prueba de variables de entorno
    console.log('AuthProvider: Verificando variables de entorno...');
    testEnvVariables();
    
    // Ejecutar prueba de conectividad
    const runFirebaseTest = async () => {
      try {
        const testResult = await testFirebaseConnection();
        if (!testResult) {
          console.error('AuthProvider: Prueba de Firebase falló');
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error('AuthProvider: Error en prueba de Firebase:', error);
      }
    };
    
    // Inicializar autenticación
    const initAuth = async () => {
      try {
        console.log('AuthProvider: Verificando sesión existente...');
        
        // Verificar si hay una sesión guardada
        const session = await AuthService.getCurrentSession();
        if (session) {
          console.log('AuthProvider: Sesión encontrada:', session.uid);
          setUser(session);
        } else {
          console.log('AuthProvider: No hay sesión existente');
        }

        // Configurar listener de cambios de autenticación
        const authInstance = auth();
        const unsubscribe = authInstance.onAuthStateChanged(async (firebaseUser: any) => {
          console.log('AuthProvider: Estado de autenticación cambiado:', firebaseUser ? 'Usuario autenticado' : 'Usuario no autenticado');
          
          if (firebaseUser) {
            // Usuario autenticado en Firebase
            const session = await AuthService.getCurrentSession();
            if (session) {
              setUser(session);
            }
          } else {
            // Usuario no autenticado
            setUser(null);
          }
          
          setLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error('AuthProvider: Error al inicializar Firebase Auth:', error);
        setLoading(false);
      }
    };

    // Ejecutar prueba primero, luego inicializar auth
    const timer = setTimeout(async () => {
      await runFirebaseTest();
      initAuth();
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  const login = async (phoneNumber: string) => {
    try {
      console.log('AuthProvider: Iniciando login con:', phoneNumber);
      const confirmation = await AuthService.sendVerificationCode(phoneNumber);
      return confirmation;
    } catch (error) {
      console.error('AuthProvider: Error en login:', error);
      throw error;
    }
  };

  const verifyCode = async (confirmation: any, code: string) => {
    try {
      console.log('AuthProvider: Verificando código...');
      const firebaseUser = await AuthService.verifyCodeAndSignIn(confirmation, code);
      
      // Guardar sesión
      const session = await AuthService.saveUserSession(firebaseUser, firebaseUser.phoneNumber);
      setUser(session);
      
      console.log('AuthProvider: Usuario autenticado exitosamente:', session.uid);
    } catch (error) {
      console.error('AuthProvider: Error verificando código:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('AuthProvider: Cerrando sesión...');
      await AuthService.signOut();
      setUser(null);
      console.log('AuthProvider: Sesión cerrada exitosamente');
    } catch (error) {
      console.error('AuthProvider: Error al cerrar sesión:', error);
      throw error;
    }
  };

  const value = {
    isAuthenticated: !!user,
    userId: user?.uid || null,
    user,
    loading,
    logout,
    login,
    verifyCode
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto
export const useAuth = () => {
  return useContext(AuthContext);
};
