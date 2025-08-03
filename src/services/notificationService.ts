import { supabase } from './supabaseClient';

export interface NotificationData {
  title: string;
  message: string;
  type: 'ride_started' | 'ride_update' | 'driver_arrived' | 'ride_completed';
  rideId: string;
  userId?: string;
  driverId?: string;
}

class NotificationService {
  async sendRideStartedNotification(rideId: string, userId: string, driverId: string) {
    try {
      console.log('[NotificationService] Enviando notificación de viaje iniciado');
      
      // Crear notificación en la base de datos
      const { data, error } = await supabase
        .from('messages')
        .insert({
          type: 'ride_update',
          title: '¡Viaje Iniciado!',
          message: 'El conductor ha iniciado el viaje. Está en camino hacia tu ubicación.',
          user_id: userId,
          driver_id: driverId,
          data: {
            rideId,
            notificationType: 'ride_started',
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        console.error('[NotificationService] Error al crear notificación:', error);
        return;
      }

      console.log('[NotificationService] Notificación creada exitosamente:', data);
      
      // Aquí podrías integrar con un servicio de push notifications como Expo Notifications
      // Por ahora, solo creamos la notificación en la base de datos
      
    } catch (error) {
      console.error('[NotificationService] Error al enviar notificación:', error);
    }
  }

  async sendETAUpdateNotification(rideId: string, userId: string, eta: string, etaDescription: string) {
    try {
      console.log('[NotificationService] Enviando notificación de actualización de ETA');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          type: 'ride_update',
          title: 'Actualización de Tiempo',
          message: `${etaDescription}: ${eta}`,
          user_id: userId,
          data: {
            rideId,
            notificationType: 'eta_update',
            eta,
            etaDescription,
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        console.error('[NotificationService] Error al crear notificación de ETA:', error);
        return;
      }

      console.log('[NotificationService] Notificación de ETA creada:', data);
      
    } catch (error) {
      console.error('[NotificationService] Error al enviar notificación de ETA:', error);
    }
  }

  async sendDriverArrivedNotification(rideId: string, userId: string, driverId: string) {
    try {
      console.log('[NotificationService] Enviando notificación de llegada del conductor');
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          type: 'ride_update',
          title: 'Conductor Llegó',
          message: 'El conductor ha llegado a tu ubicación. ¡Prepárate para el viaje!',
          user_id: userId,
          driver_id: driverId,
          data: {
            rideId,
            notificationType: 'driver_arrived',
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        console.error('[NotificationService] Error al crear notificación de llegada:', error);
        return;
      }

      console.log('[NotificationService] Notificación de llegada creada:', data);
      
    } catch (error) {
      console.error('[NotificationService] Error al enviar notificación de llegada:', error);
    }
  }

  async getUnreadNotifications(userId: string) {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[NotificationService] Error al obtener notificaciones:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[NotificationService] Error al obtener notificaciones:', error);
      return [];
    }
  }

  async markNotificationAsRead(notificationId: string) {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('[NotificationService] Error al marcar notificación como leída:', error);
      }
    } catch (error) {
      console.error('[NotificationService] Error al marcar notificación como leída:', error);
    }
  }
}

export const notificationService = new NotificationService(); 