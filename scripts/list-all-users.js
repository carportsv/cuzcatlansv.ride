const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listAllUsers() {
  console.log('🔍 Listando todos los usuarios en Supabase...');

  try {
    // Listar todos los usuarios
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*');

    if (userError) {
      console.error('❌ Error listando usuarios:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('📊 No hay usuarios en Supabase');
    } else {
      console.log(`📊 Total usuarios en Supabase: ${users.length}`);
      users.forEach((user, index) => {
        console.log(`\n👤 Usuario ${index + 1}:`);
        console.log(`   ID: ${user.id}`);
        console.log(`   Firebase UID: ${user.firebase_uid}`);
        console.log(`   Nombre: ${user.display_name}`);
        console.log(`   Email: ${user.email || 'Sin email'}`);
        console.log(`   Teléfono: ${user.phone_number || 'Sin teléfono'}`);
        console.log(`   Rol: ${user.role}`);
        console.log(`   Creado: ${user.created_at}`);
        console.log(`   Actualizado: ${user.updated_at}`);
      });
    }

    // Listar todos los conductores
    console.log('\n🔍 Listando todos los conductores en Supabase...');
    const { data: drivers, error: driverError } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(display_name, phone_number, role)
      `);

    if (driverError) {
      console.error('❌ Error listando conductores:', driverError);
    } else {
      if (!drivers || drivers.length === 0) {
        console.log('🚗 No hay conductores en Supabase');
      } else {
        console.log(`🚗 Total conductores en Supabase: ${drivers.length}`);
        drivers.forEach((driver, index) => {
          console.log(`\n🚗 Conductor ${index + 1}:`);
          console.log(`   ID: ${driver.id}`);
          console.log(`   Usuario: ${driver.user?.display_name || 'Sin nombre'}`);
          console.log(`   Teléfono: ${driver.user?.phone_number || 'Sin teléfono'}`);
          console.log(`   Rol: ${driver.user?.role || 'Sin rol'}`);
          console.log(`   Disponible: ${driver.is_available ? 'Sí' : 'No'}`);
          console.log(`   Estado: ${driver.status}`);
          console.log(`   Calificación: ${driver.rating}`);
          console.log(`   Vehículo: ${driver.car_info?.model} ${driver.car_info?.year}`);
          console.log(`   Placa: ${driver.car_info?.plate}`);
        });
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

listAllUsers(); 