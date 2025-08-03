require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDriverStatus() {
  console.log('🔍 Verificando estado de conductores...\n');

  try {
    // Obtener todos los conductores
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select(`
        id,
        is_available,
        status,
        location,
        user:users(display_name, email, firebase_uid)
      `);

    if (error) {
      console.error('❌ Error obteniendo conductores:', error);
      return;
    }

    console.log(`📊 Total de conductores en la base de datos: ${drivers.length}\n`);

    drivers.forEach((driver, index) => {
      console.log(`🚗 Conductor ${index + 1}:`);
      console.log(`   ID: ${driver.id}`);
      console.log(`   Nombre: ${driver.user?.display_name || 'N/A'}`);
      console.log(`   Email: ${driver.user?.email || 'N/A'}`);
      console.log(`   Firebase UID: ${driver.user?.firebase_uid || 'N/A'}`);
      console.log(`   Disponible: ${driver.is_available ? '✅ Sí' : '❌ No'}`);
      console.log(`   Estado: ${driver.status}`);
      console.log(`   Ubicación: ${driver.location ? `${driver.location.latitude}, ${driver.location.longitude}` : 'N/A'}`);
      console.log('');
    });

    // Verificar conductores disponibles
    const availableDrivers = drivers.filter(d => d.is_available && d.status === 'active');
    console.log(`✅ Conductores disponibles: ${availableDrivers.length}`);

    if (availableDrivers.length === 0) {
      console.log('⚠️  No hay conductores disponibles. Esto explica por qué no aparecen en la pantalla del usuario.');
    } else {
      console.log('✅ Hay conductores disponibles. El problema puede estar en la consulta o en tiempo real.');
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkDriverStatus(); 