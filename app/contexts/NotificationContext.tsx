import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as Notifications from 'expo-notifications';

interface NotificationContextType {
  showLocalNotification: (title: string, body: string) => Promise<void>;
  showPushNotification: (title: string, body: string) => Promise<void>;
  registerForPushNotifications: () => Promise<string | null>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  useEffect(() => {
    registerForPushNotifications();
  }, []);

  const registerForPushNotifications = async (): Promise<string | null> => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.warn('Permisos de notificación no concedidos');
        return null;
      }

      const token = await Notifications.getExpoPushTokenAsync({
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
      });
      
      setExpoPushToken(token.data);
      return token.data;
    } catch (error) {
      console.error('Error registrando para notificaciones push:', error);
      return null;
    }
  };

  const showLocalNotification = async (title: string, body: string): Promise<void> => {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
        },
        trigger: null, // Mostrar inmediatamente
      });
    } catch (error) {
      console.error('Error mostrando notificación local:', error);
    }
  };

  const showPushNotification = async (title: string, body: string): Promise<void> => {
    try {
      if (!expoPushToken) {
        console.warn('No hay token de push disponible');
        return;
      }

      // En una implementación real, aquí enviarías la notificación a través de tu servidor
      console.log('Enviando notificación push:', { title, body, token: expoPushToken });
    } catch (error) {
      console.error('Error enviando notificación push:', error);
    }
  };

  const value = {
    showLocalNotification,
    showPushNotification,
    registerForPushNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

export default NotificationContext;
