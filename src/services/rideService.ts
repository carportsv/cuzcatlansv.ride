import { supabase } from './supabaseClient';
import { trackRead, trackWrite } from './usageMonitor';

// Tipos de estado del viaje
export type RideStatus = 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface LocationData {
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export interface RideRequest {
  id?: string;
  userId: string;
  driverId?: string;
  origin: LocationData;
  destination: LocationData;
  status: RideStatus;
  price?: number;
  distance?: number;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
  cancellationReason?: string;
}

export interface DriverData {
  id: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
  location?: {
    latitude: number;
    longitude: number;
  };
  status: string;
  name: string;
  phoneNumber: string;
  car?: {
    model: string;
    plate: string;
  };
  rating?: number;
  totalRides?: number;
  earnings?: number;
}

// Crear una nueva solicitud de viaje
export const createRideRequest = async (rideData: Omit<RideRequest, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const now = new Date();
    const rideRequestData = {
      user_id: rideData.userId,
      driver_id: rideData.driverId,
      origin: rideData.origin,
      destination: rideData.destination,
      status: rideData.status,
      price: rideData.price,
      distance: rideData.distance ? Math.round(rideData.distance) : null,
      duration: rideData.duration ? Math.round(rideData.duration) : null,
      created_at: now,
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('ride_requests')
      .insert(rideRequestData)
      .select()
      .single();

    if (error) {
      console.error('Error al crear la solicitud de viaje:', error);
      throw error;
    }

    console.log('Solicitud de viaje creada con ID:', data.id);
    
    // Rastrear escritura
    await trackWrite();
    
    return data.id;
  } catch (error) {
    console.error('Error al crear la solicitud de viaje:', error);
    throw error;
  }
};

// Actualizar el estado de un viaje
export const updateRideStatus = async (rideId: string, status: RideStatus, driverId?: string, price?: number) => {
  try {
    const updateData: any = {
      status,
      updated_at: new Date(),
    };

    if (driverId) {
      updateData.driver_id = driverId;
    }

    if (price) {
      updateData.price = price;
    }

    const { error } = await supabase
      .from('ride_requests')
      .update(updateData)
      .eq('id', rideId);

    if (error) {
      console.error('Error al actualizar el estado del viaje:', error);
      throw error;
    }

    console.log('Estado del viaje actualizado:', status);
    
    // Rastrear escritura
    await trackWrite();
  } catch (error) {
    console.error('Error al actualizar el estado del viaje:', error);
    throw error;
  }
};

// Aceptar un viaje por un conductor
export const acceptRide = async (rideId: string, driverId: string, price: number) => {
  try {
    await updateRideStatus(rideId, 'accepted', driverId, price);
    
    // Actualizar el estado del conductor a no disponible
    const { error } = await supabase
      .from('drivers')
      .update({ is_available: false, updated_at: new Date() })
      .eq('id', driverId);

    if (error) {
      console.error('Error al actualizar el estado del conductor:', error);
      throw error;
    }
    
    console.log('Viaje aceptado por el conductor:', driverId);
    
    // Rastrear escritura adicional
    await trackWrite();
  } catch (error) {
    console.error('Error al aceptar el viaje:', error);
    throw error;
  }
};

// Obtener conductores disponibles en tiempo real (OPTIMIZADO)
export const watchAvailableDrivers = async (callback: (drivers: DriverData[]) => void, maxDrivers: number = 10) => {
  console.log('Iniciando watchAvailableDrivers...');
  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .eq('isAvailable', true)
    .eq('status', 'active')
    .order('updated_at', { ascending: false })
    .limit(maxDrivers);

  if (error) {
    console.error('Error al obtener conductores disponibles:', error);
    return;
  }

  console.log('Conductores disponibles encontrados:', data?.length || 0);
  
  // Rastrear lectura
  await trackRead(data?.length || 0);
  
  const drivers = (data || []).map((row: any) => ({
    id: row.id,
    isAvailable: row.isAvailable,
    createdAt: row.createdAt,
    updatedAt: row.updated_at,
    location: row.location,
    status: row.status,
    name: row.name,
    phoneNumber: row.phoneNumber,
    car: row.car,
    rating: row.rating,
    totalRides: row.totalRides,
    earnings: row.earnings,
  } as DriverData));

  if (drivers.length === 0) {
    console.log('No se encontraron conductores disponibles');
  } else {
    console.log('Conductores disponibles encontrados:', drivers.length);
  }
  
  callback(drivers);
};

// Obtener conductores disponibles con paginación
export const getAvailableDriversPaginated = async (
  lastDriver?: DriverData, 
  pageSize: number = 10
): Promise<DriverData[]> => {
  try {
    const { data, error } = await supabase
      .from('drivers')
      .select('*')
      .eq('isAvailable', true)
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .range(0, pageSize - 1);

    if (error) {
      console.error('Error al obtener conductores con paginación:', error);
      return [];
    }
    
    // Rastrear lectura
    await trackRead(data.length);
    
    return data.map((row: any) => ({
      id: row.id,
      ...(row || {})
    } as DriverData));
  } catch (error) {
    console.error('Error al obtener conductores con paginación:', error);
    return [];
  }
};

// Escuchar solicitudes de viaje para un conductor (OPTIMIZADO)
export const watchRideRequests = async (
  driverId: string, 
  callback: (rides: Array<RideRequest & { id: string }>) => void,
  maxRequests: number = 20
) => {
  console.log('Iniciando watchRideRequests optimizado');
  const { data, error } = await supabase
    .from('ride_requests')
    .select('*')
    .eq('status', 'requested')
    .order('created_at', { ascending: false })
    .limit(maxRequests);

  if (error) {
    console.error('Error en watchRideRequests:', error);
    return;
  }

  console.log('Snapshot recibido, documentos:', data?.length || 0);
  
  // Rastrear lectura
  trackRead(data.length);
  
  const rides = data.map((row: any) => ({
    id: row.id,
    origin: row.origin,
    destination: row.destination,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updated_at,
    price: row.price,
    distance: row.distance,
    duration: row.duration,
    cancellationReason: row.cancellationReason,
  } as RideRequest & { id: string }));
  callback(rides);
};

// Obtener historial de viajes con paginación
export const getRideHistory = async (
  userId: string,
  userType: 'user' | 'driver',
  lastRide?: RideRequest,
  pageSize: number = 15
): Promise<Array<RideRequest & { id: string }>> => {
  try {
    const field = userType === 'user' ? 'user_id' : 'driver_id';
    const { data, error } = await supabase
      .from('ride_requests')
      .select('*')
      .eq(field, userId)
      .in('status', ['completed', 'cancelled'])
      .order('created_at', { ascending: false })
      .range(0, pageSize - 1);

    if (error) {
      console.error('Error al obtener historial de viajes:', error);
      return [];
    }
    
    // Rastrear lectura
    await trackRead(data.length);
    
    return data.map((row: any) => ({
      id: row.id,
      ...(row || {})
    } as RideRequest & { id: string }));
  } catch (error) {
    console.error('Error al obtener historial de viajes:', error);
    return [];
  }
};

// Obtener viaje activo optimizado
export const getActiveRide = async (userId: string, userType: 'user' | 'driver') => {
  try {
    const field = userType === 'user' ? 'user_id' : 'driver_id';
    const { data, error } = await supabase
      .from('ride_requests')
      .select('*')
      .eq(field, userId)
      .in('status', ['accepted', 'in_progress'])
      .limit(1);

    if (error) {
      console.error('Error al obtener viaje activo:', error);
      return null;
    }
    
    // Rastrear lectura
    await trackRead(data.length);
    
    if (data.length > 0) {
      const ride = data[0];
      return {
        id: ride.id,
        ...(ride || {})
      } as RideRequest & { id: string };
    }
    return null;
  } catch (error) {
    console.error('Error al obtener viaje activo:', error);
    return null;
  }
};