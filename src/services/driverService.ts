import { supabase } from './supabaseClient';

export interface Driver {
  id: string;
  firebase_uid: string;
  display_name: string;
  email: string;
  is_available: boolean;
  status: string;
  current_location?: { latitude: number; longitude: number };
  created_at: string;
  updated_at: string;
}

export class DriverService {
  /**
   * Obtiene el driver_id de Supabase usando el firebase_uid
   */
  static async getDriverIdByFirebaseUid(firebaseUid: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error) {
        console.error('[DriverService] Error obteniendo driver_id:', error);
        return null;
      }

      return data?.id || null;
    } catch (error) {
      console.error('[DriverService] Error en getDriverIdByFirebaseUid:', error);
      return null;
    }
  }

  /**
   * Obtiene los datos completos del driver
   */
  static async getDriverByFirebaseUid(firebaseUid: string): Promise<Driver | null> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('firebase_uid', firebaseUid)
        .single();

      if (error) {
        console.error('[DriverService] Error obteniendo driver:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[DriverService] Error en getDriverByFirebaseUid:', error);
      return null;
    }
  }

  /**
   * Registra o actualiza un driver
   */
  static async registerDriver(driverData: {
    firebase_uid: string;
    display_name: string;
    email: string;
    is_available?: boolean;
    status?: string;
    current_location?: { latitude: number; longitude: number };
  }): Promise<Driver | null> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .upsert({
          ...driverData,
          is_available: driverData.is_available ?? true,
          status: driverData.status ?? 'active',
        })
        .select()
        .single();

      if (error) {
        console.error('[DriverService] Error registrando driver:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[DriverService] Error en registerDriver:', error);
      return null;
    }
  }

  /**
   * Actualiza la disponibilidad del driver
   */
  static async updateDriverAvailability(
    driverId: string, 
    isAvailable: boolean
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          is_available: isAvailable,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (error) {
        console.error('[DriverService] Error actualizando disponibilidad:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[DriverService] Error en updateDriverAvailability:', error);
      return false;
    }
  }

  /**
   * Actualiza la ubicación actual del driver
   */
  static async updateDriverLocation(
    driverId: string, 
    location: { latitude: number; longitude: number }
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('drivers')
        .update({ 
          current_location: location,
          updated_at: new Date().toISOString()
        })
        .eq('id', driverId);

      if (error) {
        console.error('[DriverService] Error actualizando ubicación:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('[DriverService] Error en updateDriverLocation:', error);
      return false;
    }
  }

  /**
   * Obtiene todos los conductores disponibles
   */
  static async getAvailableDrivers(
    latitude?: number,
    longitude?: number,
    radiusKm?: number
  ): Promise<Driver[]> {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('is_available', true)
        .eq('status', 'active');

      if (error) {
        console.error('[DriverService] Error obteniendo conductores disponibles:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[DriverService] Error en getAvailableDrivers:', error);
      return [];
    }
  }


} 