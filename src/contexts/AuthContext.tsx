import { AuthService, syncUserWithSupabase } from '@/services/authService';
import { getUserRoleFromSupabase } from '@/services/userFirestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { getAuthInstanceAsync, initFirebaseAsync } from '../services/firebaseConfig';

type UserType = 'user' | 'driver' | 'admin';

interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
  user: UserSession | null;
  userType: UserType | null;
  loading: boolean;
  logout: () => Promise<void>;
  login: (phoneNumber: string) => Promise<any>;
  verifyCode: (confirmation: any, code: string) => Promise<void>;
  setUserType: (type: UserType) => Promise<void>;
  refreshAuthState: () => Promise<void>;
}

interface UserSession {
  uid: string;
  phoneNumber: string;
  email?: string;
  name?: string;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserSession | null>(null);
  const [userType, setUserTypeState] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const authListenerRef = useRef<(() => void) | null>(null);
  const isInitializedRef = useRef(false);

  // Calcular valores derivados
  const isAuthenticated = !!user;
  const userId = user?.uid || null;

  const loadUserType = async () => {
    try {
      const storedUserType = await AsyncStorage.getItem('userType');
      if (storedUserType && ['user', 'driver', 'admin'].includes(storedUserType)) {
        setUserTypeState(storedUserType as UserType);
      }
    } catch (error) {
      console.error('Error loading user type:', error);
    }
  };

  const setUserType = async (type: UserType) => {
    try {
      await AsyncStorage.setItem('userType', type);
      setUserTypeState(type);
    } catch (error) {
      console.error('Error setting user type:', error);
    }
  };

  // Función para refrescar el estado de autenticación manualmente
  const refreshAuthState = async () => {
    try {
      console.log('AuthProvider: Refrescando estado de autenticación...');
      const session = await AuthService.getCurrentSession();
      if (session) {
        console.log('AuthProvider: Sesión encontrada al refrescar:', session.uid);
        safeSetUser(session);
      } else {
        console.log('AuthProvider: No hay sesión al refrescar');
        safeSetUser(null);
      }
      
      // Recargar tipo de usuario
      await loadUserType();
    } catch (error) {
      console.error('AuthProvider: Error refrescando estado:', error);
    }
  };

  // Blindar setUser para evitar ciclos por cambio de UID repetido
  const safeSetUser = async (session: UserSession | null) => {
    // Si no hay usuario previo y hay sesión nueva
    if (session) {
      let role = 'user'; // Valor por defecto
      try {
        role = await getUserRoleFromSupabase(session.uid) || 'user';
      } catch (roleError) {
        console.warn('AuthContext: Error obteniendo rol, usando por defecto:', roleError);
        // Si no encuentra el usuario en Supabase, usar rol por defecto
        role = 'user';
      }
      await AsyncStorage.setItem('userType', role);
      setUserTypeState(role as UserType);
    }
    setUser(prev => {
      // Si no hay usuario previo y hay sesión nueva
      if (!prev && session) {
        console.log('AuthProvider: setUser (nuevo login):', session.uid);
        return session;
      }
      // Si hay usuario previo y hay sesión nueva con UID diferente
      if (prev && session && prev.uid !== session.uid) {
        console.log('AuthProvider: setUser (cambio de usuario):', prev.uid, '->', session.uid);
        return session;
      }
      // Si hay usuario previo y no hay sesión (logout)
      if (!session && prev) {
        console.log('AuthProvider: setUser (logout):', prev.uid, '-> null');
        return null;
      }
      // No hay cambio real, mantener el estado actual
      console.log('AuthProvider: setUser (sin cambios):', prev?.uid || 'null');
      return prev;
    });
  };

  // Inicializar autenticación
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    const initAuth = async () => {
      try {
        console.log('[AuthContext] Iniciando inicialización de autenticación...');
        setLoading(true);
        
        // Inicializar Firebase primero
        try {
          await initFirebaseAsync();
          console.log('[AuthContext] Firebase inicializado correctamente');
        } catch (firebaseError) {
          console.warn('[AuthContext] Error inicializando Firebase:', firebaseError);
        }

        // Verificar sesión almacenada localmente primero
        try {
          const storedSession = await AuthService.getCurrentSession();
          if (storedSession) {
            console.log('[AuthContext] Sesión almacenada encontrada:', storedSession.uid);
            await safeSetUser(storedSession);
            setLoading(false);
          }
        } catch (sessionError) {
          console.warn('[AuthContext] Error verificando sesión almacenada:', sessionError);
        }

        // Configurar listener de Firebase Auth
        try {
          const auth = await getAuthInstanceAsync();
          const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            try {
              console.log('[AuthContext] Firebase Auth state changed:', firebaseUser?.uid);
              if (firebaseUser) {
                // Usuario autenticado en Firebase
                const session = await AuthService.getCurrentSession();
                if (session && session.uid === firebaseUser.uid) {
                  console.log('[AuthContext] Sesión válida encontrada:', session.uid);
                  await safeSetUser(session);
                } else {
                  console.log('[AuthContext] Creando nueva sesión para usuario de Firebase...');
                  // Crear sesión básica y usuario en Supabase
                  const basicSession = {
                    uid: firebaseUser.uid,
                    phoneNumber: firebaseUser.phoneNumber || '',
                    email: firebaseUser.email || '',
                    name: firebaseUser.displayName || ''
                  };
                  
                  // Crear usuario en Supabase automáticamente
                  try {
                    const syncResult = await syncUserWithSupabase(firebaseUser);
                    if (syncResult) {
                      console.log('[AuthContext] Usuario sincronizado con Supabase exitosamente');
                    } else {
                      console.warn('[AuthContext] Error sincronizando con Supabase');
                    }
                  } catch (createError) {
                    console.error('[AuthContext] Error creando usuario en Supabase:', createError);
                  }
                  
                  await safeSetUser(basicSession);
                }
              } else {
                console.log('[AuthContext] Usuario no autenticado en Firebase');
                // Solo limpiar si no hay sesión almacenada válida
                const storedSession = await AuthService.getCurrentSession();
                if (!storedSession) {
                  safeSetUser(null);
                }
              }
            } catch (error) {
              console.error('[AuthContext] Error en onAuthStateChanged:', error);
              // No limpiar automáticamente en caso de error
            } finally {
              setLoading(false);
            }
          });

          authListenerRef.current = unsubscribe;
        } catch (listenerError) {
          console.warn('[AuthContext] Error configurando listener de Firebase:', listenerError);
          setLoading(false);
        }

      } catch (error) {
        console.error('[AuthContext] Error en inicialización:', error);
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  // Asegurar que el userType se establezca cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && !loading && !userType) {
      console.log('AuthProvider: Usuario autenticado sin userType, estableciendo como "user"');
      setUserType('user');
    }
  }, [isAuthenticated, loading, userType, setUserType]);

  // Forzar actualización del contexto cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && !loading && userType) {
      console.log('AuthProvider: Usuario autenticado y listo, forzando actualización del contexto');
      // Forzar un re-render del contexto para que index.tsx detecte el cambio
      setUser(prev => prev);
    }
  }, [isAuthenticated, loading, userType]);

  const login = async (phoneNumber: string) => {
    try {
      console.log('AuthProvider: Iniciando login con:', phoneNumber);
      // Limpiar sesión previa antes de login
      await logout();
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
      
      // Sincronizar con Supabase automáticamente
      console.log('AuthProvider: Sincronizando con Supabase...');
      const syncResult = await syncUserWithSupabase(firebaseUser);
      
      if (!syncResult) {
        console.warn('AuthProvider: Error sincronizando con Supabase, continuando con Firebase');
      } else {
        console.log('AuthProvider: Sincronización con Supabase exitosa');
      }
      
      // Guardar sesión
      const session = await AuthService.saveUserSession(firebaseUser, firebaseUser.phoneNumber);
      safeSetUser(session);
      
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
      safeSetUser(null);
      setUserTypeState(null);
      // Limpiar tipo de usuario
      await AsyncStorage.removeItem('userType');
      console.log('AuthProvider: Sesión cerrada exitosamente');
    } catch (error) {
      console.error('AuthProvider: Error cerrando sesión:', error);
    }
  };

  const contextValue: AuthContextType = {
    isAuthenticated,
    userId,
    user,
    userType,
    loading,
    logout,
    login,
    verifyCode,
    setUserType,
    refreshAuthState
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
