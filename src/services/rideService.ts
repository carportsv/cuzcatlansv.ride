import firestore from '@react-native-firebase/firestore';
const db = firestore();

// Tipos de estado del viaje
export type RideStatus = 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

// Interfaz para los datos del viaje
export interface RideData {
  id: string;
  userId: string;
  driverId: string;
  status: RideStatus;
  origin: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  destination: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  createdAt: string;
  updatedAt: string;
  price?: number;
  distance?: number;
  duration?: number;
  paymentMethod?: string;
  rating?: number;
  comments?: string;
  driverLocation?: { latitude: number; longitude: number; };
  driverName?: string;
  driverCar?: {
    model: string;
    plate: string;
    color: string;
  };
}

// Interfaz para los datos del conductor
export interface DriverData {
  id: string;
  isAvailable: boolean;
  status: 'active' | 'inactive';
  location: {
    latitude: number;
    longitude: number;
  };
  name: string;
  phoneNumber: string;
  car: {
    model: string;
    plate: string;
    color: string;
  };
  rating: number;
  totalRides: number;
  earnings: number;
  createdAt: string;
  updatedAt: string;
}

// Interfaz para las solicitudes de viaje
export interface RideRequest {
  id?: string;
  userId: string;
  driverId?: string;
  origin: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  destination: {
    address: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  status: RideStatus;
  createdAt: string;
  updatedAt: string;
  price?: number;
  distance?: number;
  duration?: number;
  cancellationReason?: string;
}

// Obtener conductores disponibles en tiempo real
export const watchAvailableDrivers = (callback: (drivers: DriverData[]) => void) => {
  console.log('Iniciando watchAvailableDrivers...');
  const driversRef = db.collection('drivers');
  const q = driversRef.where('isAvailable', '==', true);
  
  console.log('Query configurada:', q);
  return q.onSnapshot((snapshot) => {
    console.log('Snapshot de conductores recibido. Documentos:', snapshot.docs.length);
    console.log('Documentos vacíos:', snapshot.docs.filter(doc => !doc.exists()).length);
    
    const drivers = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        isAvailable: data.isAvailable,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        location: data.location,
        status: data.status,
        name: data.name,
        phoneNumber: data.phoneNumber,
        car: data.car,
        rating: data.rating,
        totalRides: data.totalRides,
        earnings: data.earnings,
      } as DriverData;
    });

    if (drivers.length === 0) {
      console.log('No se encontraron conductores disponibles');
    } else {
      console.log('Conductores disponibles encontrados:', drivers.length);
      drivers.forEach(driver => {
        console.log('Conductor disponible:', {
          id: driver.id,
          isAvailable: driver.isAvailable,
          status: driver.status,
          location: driver.location
        });
      });
    }
    
    callback(drivers);
  }, (error) => {
    console.error('Error en watchAvailableDrivers:', error);
  });
};

// Crear una nueva solicitud de viaje
export const createRideRequest = async (rideData: Omit<RideRequest, 'status' | 'createdAt' | 'updatedAt'>) => {
  try {
    console.log('🚀 createRideRequest iniciado');
    console.log('📊 Datos recibidos:', JSON.stringify(rideData, null, 2));
    
    const rideRequest = {
      ...rideData,
      status: 'requested' as RideStatus,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    console.log('📝 Solicitud formateada:', JSON.stringify(rideRequest, null, 2));
    console.log('🔥 Agregando documento a Firestore...');
    
    const docRef = await db.collection('rideRequests').add(rideRequest);
    console.log('✅ Documento creado con ID:', docRef.id);
    
    const result = { id: docRef.id, ...rideRequest };
    console.log('🎉 Resultado final:', result);
    
    return result;
  } catch (error) {
    console.error('❌ Error creating ride request:', error);
    console.error('Stack trace:', (error as Error).stack);
    throw error;
  }
};

// Escuchar solicitudes de viaje para un conductor
export const watchRideRequests = (driverId: string, callback: (rides: Array<RideRequest & { id: string }>) => void) => {
  console.log('Iniciando watchRideRequests');
  const q = db.collection('rideRequests').where('status', '==', 'requested');

  return q.onSnapshot((snapshot) => {
    console.log('Snapshot recibido, documentos:', snapshot.docs.length);
    const rides = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        origin: data.origin,
        destination: data.destination,
        status: data.status,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        price: data.price,
        distance: data.distance,
        duration: data.duration,
        cancellationReason: data.cancellationReason,
      } as RideRequest & { id: string };
    });
    callback(rides);
  }, (error) => {
    console.error('Error en watchRideRequests:', error);
  });
};

// Aceptar una solicitud de viaje
export const acceptRide = async (rideId: string, driverId: string, price: number) => {
  const rideRef = db.collection('rideRequests').doc(rideId);
  
  await rideRef.update({
    status: 'accepted',
    driverId,
    price,
    updatedAt: new Date().toISOString()
  });
};

// Actualizar estado de disponibilidad del conductor
export const updateDriverAvailability = async (driverId: string, isAvailable: boolean) => {
  console.log('Actualizando disponibilidad del conductor:', { driverId, isAvailable });
  const driverRef = db.collection('drivers').doc(driverId);
  
  try {
    const driverDoc = await driverRef.get();
    const currentData = driverDoc.exists() ? driverDoc.data() : null;
    console.log('Datos actuales del conductor:', currentData);
    
    if (!driverDoc.exists()) {
      console.log('Creando nuevo documento de conductor...');
      const newDriverData: DriverData = {
        id: driverId,
        isAvailable,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        location: {
          latitude: 0,
          longitude: 0
        },
        status: 'active',
        name: 'Conductor',
        phoneNumber: '',
        car: {
          model: '',
          plate: '',
          color: ''
        },
        rating: 0,
        totalRides: 0,
        earnings: 0
      };
      
      await driverRef.set(newDriverData);
      console.log('Nuevo conductor creado:', newDriverData);
    } else {
      console.log('Actualizando conductor existente...');
      const updateData = {
        isAvailable,
        updatedAt: new Date().toISOString(),
        status: isAvailable ? 'active' : 'inactive'
      };
      
      await driverRef.update(updateData);
      console.log('Conductor actualizado con:', updateData);
    }

    // Verificar que los cambios se guardaron
    const updatedDoc = await driverRef.get();
    console.log('Documento actualizado en Firestore:', updatedDoc.data());
    
  } catch (error) {
    console.error('Error al actualizar disponibilidad:', error);
    throw error;
  }
};

export const updateRideStatus = async (rideId: string, status: RideStatus, driverId?: string) => {
  try {
    const rideRef = db.collection('rideRequests').doc(rideId);
    const updateData: Partial<RideData> = { status };
    if (driverId) {
      updateData.driverId = driverId;
    }
    await rideRef.update(updateData);
  } catch (error) {
    console.error('Error updating ride status:', error);
    throw error;
  }
};