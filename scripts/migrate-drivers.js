const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Datos de conductores existentes en Firebase (simulados)
// En un caso real, estos vendrían de una exportación de Firebase
const existingDrivers = [
  {
    firebase_uid: 'driver_1_firebase_uid',
    email: 'carlos.mendoza@example.com',
    display_name: 'Carlos Mendoza',
    phone_number: '+503 7123-4567',
    role: 'driver',
    car_info: {
      model: 'Toyota Corolla',
      plate: 'ABC-123',
      year: 2020
    },
    documents: {
      license: 'LIC-123456',
      insurance: 'INS-789012',
      registration: 'REG-345678'
    },
    location: {
      latitude: 13.7942 + (Math.random() - 0.5) * 0.01,
      longitude: -88.8965 + (Math.random() - 0.5) * 0.01
    },
    rating: 4.7,
    total_rides: 85,
    earnings: 1250.50
  },
  {
    firebase_uid: 'driver_2_firebase_uid',
    email: 'maria.lopez@example.com',
    display_name: 'María López',
    phone_number: '+503 7123-4568',
    role: 'driver',
    car_info: {
      model: 'Honda Civic',
      plate: 'XYZ-789',
      year: 2019
    },
    documents: {
      license: 'LIC-234567',
      insurance: 'INS-890123',
      registration: 'REG-456789'
    },
    location: {
      latitude: 13.7942 + (Math.random() - 0.5) * 0.01,
      longitude: -88.8965 + (Math.random() - 0.5) * 0.01
    },
    rating: 4.9,
    total_rides: 120,
    earnings: 1800.75
  },
  {
    firebase_uid: 'driver_3_firebase_uid',
    email: 'juan.perez@example.com',
    display_name: 'Juan Pérez',
    phone_number: '+503 7123-4569',
    role: 'driver',
    car_info: {
      model: 'Nissan Sentra',
      plate: 'DEF-456',
      year: 2021
    },
    documents: {
      license: 'LIC-345678',
      insurance: 'INS-901234',
      registration: 'REG-567890'
    },
    location: {
      latitude: 13.7942 + (Math.random() - 0.5) * 0.01,
      longitude: -88.8965 + (Math.random() - 0.5) * 0.01
    },
    rating: 4.6,
    total_rides: 95,
    earnings: 1425.25
  }
];

async function migrateDrivers() {
  console.log('🚀 Iniciando migración de conductores desde Firebase...');

  try {
    for (const driverData of existingDrivers) {
      console.log(`📝 Migrando conductor: ${driverData.display_name}`);

      // 1. Crear/actualizar usuario en la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert({
          firebase_uid: driverData.firebase_uid,
          email: driverData.email,
          display_name: driverData.display_name,
          phone_number: driverData.phone_number,
          role: driverData.role
        }, { onConflict: 'firebase_uid' })
        .select()
        .single();

      if (userError) {
        console.error(`❌ Error creando usuario ${driverData.display_name}:`, userError);
        continue;
      }

      console.log(`✅ Usuario creado/actualizado: ${driverData.display_name}`);

      // 2. Crear/actualizar conductor en la tabla drivers
      const { error: driverError } = await supabase
        .from('drivers')
        .upsert({
          user_id: userData.id,
          is_available: true,
          status: 'active',
          location: driverData.location,
          rating: driverData.rating,
          total_rides: driverData.total_rides,
          earnings: driverData.earnings,
          car_info: driverData.car_info,
          documents: driverData.documents
        }, { onConflict: 'user_id' });

      if (driverError) {
        console.error(`❌ Error creando conductor para ${driverData.display_name}:`, driverError);
      } else {
        console.log(`✅ Conductor creado/actualizado: ${driverData.display_name}`);
      }
    }

    console.log('🎉 Migración de conductores completada');

    // Verificar conductores migrados
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(display_name, phone_number, role)
      `)
      .eq('is_available', true);

    if (error) {
      console.error('❌ Error verificando conductores:', error);
    } else {
      console.log(`📊 Conductores disponibles después de migración: ${drivers?.length || 0}`);
      drivers?.forEach(driver => {
        console.log(`  - ${driver.user?.display_name} (${driver.car_info?.model} ${driver.car_info?.year}) - Rol: ${driver.user?.role}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en migración:', error);
  }
}

// Función para migrar un usuario específico (útil para migrar usuarios reales)
async function migrateSpecificUser(firebaseUid, userData) {
  console.log(`🔄 Migrando usuario específico: ${firebaseUid}`);

  try {
    // 1. Crear/actualizar usuario
    const { data: user, error: userError } = await supabase
      .from('users')
      .upsert({
        firebase_uid: firebaseUid,
        email: userData.email || '',
        display_name: userData.display_name || 'Usuario',
        phone_number: userData.phone_number || '',
        role: userData.role || 'user'
      }, { onConflict: 'firebase_uid' })
      .select()
      .single();

    if (userError) {
      console.error('❌ Error creando usuario:', userError);
      return;
    }

    console.log(`✅ Usuario migrado: ${user.display_name}`);

    // 2. Si es conductor, crear perfil de conductor
    if (userData.role === 'driver' && userData.car_info) {
      const { error: driverError } = await supabase
        .from('drivers')
        .upsert({
          user_id: user.id,
          is_available: userData.is_available || false,
          status: userData.status || 'inactive',
          location: userData.location || null,
          rating: userData.rating || 0,
          total_rides: userData.total_rides || 0,
          earnings: userData.earnings || 0,
          car_info: userData.car_info,
          documents: userData.documents || null
        }, { onConflict: 'user_id' });

      if (driverError) {
        console.error('❌ Error creando conductor:', driverError);
      } else {
        console.log(`✅ Conductor migrado: ${user.display_name}`);
      }
    }

  } catch (error) {
    console.error('❌ Error migrando usuario específico:', error);
  }
}

// Ejecutar migración
if (process.argv.includes('--specific')) {
  // Migrar usuario específico
  const firebaseUid = process.argv[process.argv.indexOf('--specific') + 1];
  const userData = {
    email: 'usuario@example.com',
    display_name: 'Usuario Migrado',
    phone_number: '+503 7123-0000',
    role: 'driver',
    car_info: {
      model: 'Toyota Camry',
      plate: 'MIG-001',
      year: 2022
    },
    is_available: true,
    status: 'active'
  };
  
  if (firebaseUid) {
    migrateSpecificUser(firebaseUid, userData);
  } else {
    console.log('❌ Uso: node migrate-drivers.js --specific <firebase_uid>');
  }
} else {
  // Migrar conductores de ejemplo
  migrateDrivers();
} 