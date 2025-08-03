import { getUserData, updateUserData } from '@/services/userFirestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

type UserType = 'user' | 'driver' | 'admin';

type UserData = {
  name: string;
  phone: string;
  email: string;
  home: string;
  work: string;
  nick: string;
  userType: UserType;
  license?: string;
  carMake?: string;
  carModel?: string;
  carColor?: string;
  carPlate?: string;
  driverPhoto?: string;
  vehiclePhoto?: string;
  platePhoto?: string;
  setUserData: (data: Partial<UserData>) => void;
  setUserType: (type: UserType) => void;
};

const UserContext = createContext<UserData | undefined>(undefined);

// Estado inicial por defecto
const defaultUserData = {
  name: '',
  phone: '',
  email: '',
  home: '',
  work: '',
  nick: '',
  userType: 'user' as UserType,
  license: '',
  carMake: '',
  carModel: '',
  carColor: '',
  carPlate: '',
  driverPhoto: '',
  vehiclePhoto: '',
  platePhoto: '',
};

// Utilidad para normalizar y ORDENAR las claves de los datos
const normalizeAndSortUserData = (data: any) => {
  // Mapear campos de Supabase a campos del frontend
  const result: any = {
    name: data?.display_name || '',
    phone: data?.phone_number || '',
    email: data?.email || '',
    home: '', // No existe en users, se maneja en user_settings
    work: '', // No existe en users, se maneja en user_settings
    nick: '', // No existe en users
    userType: data?.role || 'user'
  };
  return result;
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [userData, setUserDataState] = useState(defaultUserData);
  const syncedUidRef = useRef<string | null>(null);

  // Sincronizar solo una vez por usuario
  useEffect(() => {
    if (!user?.uid) return;
    if (syncedUidRef.current === user.uid) return;
    const sync = async () => {
      try {
        console.log('[UserContext] Sincronizando datos desde Supabase para:', user.uid);
        const userData = await getUserData(user.uid);
        if (userData) {
          console.log('[UserContext] Datos encontrados en Supabase:', userData);
          const normalizedUserData = normalizeAndSortUserData({
            ...userData,
            phone: userData.phone || userData.phoneNumber || '',
          });
          console.log('[UserContext] Datos normalizados:', normalizedUserData);
          setUserDataState(normalizedUserData);
        } else {
          console.log('[UserContext] No se encontraron datos en Supabase para:', user.uid);
        }
        syncedUidRef.current = user.uid;
      } catch (error) {
        console.warn('[UserContext] Error sincronizando datos:', error);
        syncedUidRef.current = user.uid; // Marcar como sincronizado para evitar reintentos
      }
    };
    sync();
  }, [user?.uid]);

          // Permitir edición local sin sobrescribir desde Supabase
  const setUserData = async (newData: Partial<UserData>) => {
    setUserDataState(prev => ({ ...prev, ...newData }));
    if (user?.uid) {
      try {
        // Mapear campos del frontend a campos de Supabase
        const supabaseData: any = {};
        if (newData.name !== undefined) supabaseData.display_name = newData.name;
        if (newData.phone !== undefined) supabaseData.phone_number = newData.phone;
        if (newData.email !== undefined) supabaseData.email = newData.email;
        if (newData.userType !== undefined) supabaseData.role = newData.userType;
        
        if (Object.keys(supabaseData).length > 0) {
          await updateUserData(user.uid, supabaseData);
        }
        
        const sessionStr = await AsyncStorage.getItem('userSession');
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          await AsyncStorage.setItem('userSession', JSON.stringify({ ...session, ...newData }));
        }
      } catch (error) {
        console.error('[UserContext] Error al guardar datos:', error);
      }
    }
  };

  const setUserType = (type: UserType) => {
    setUserData({ userType: type });
  };

  // Resetear la sincronización si cambia el usuario
  useEffect(() => {
    if (user?.uid !== syncedUidRef.current) {
      syncedUidRef.current = null;
    }
  }, [user?.uid]);

  return (
    <UserContext.Provider value={{ ...userData, setUserData, setUserType }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser debe usarse dentro de UserProvider');
  return ctx;
}; 