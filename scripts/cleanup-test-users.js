const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupTestUsers() {
  console.log('🧹 Limpiando usuarios y conductores de prueba...');

  try {
    // Lista de Firebase UIDs de prueba que deben eliminarse
    const testUserUids = [
      'test_driver_1',
      'test_driver_2', 
      'test_driver_3',
      'driver_1_firebase_uid',
      'driver_2_firebase_uid',
      'driver_3_firebase_uid',
      'user_1_firebase_uid',
      'user_2_firebase_uid'
    ];

    console.log(`\n📋 Usuarios de prueba a eliminar: ${testUserUids.length}`);
    testUserUids.forEach(uid => console.log(`   - ${uid}`));

    // Obtener los IDs de usuario de los usuarios de prueba
    const { data: testUsers, error: userError } = await supabase
      .from('users')
      .select('id, firebase_uid, display_name')
      .in('firebase_uid', testUserUids);

    if (userError) {
      console.error('❌ Error obteniendo usuarios de prueba:', userError);
      return;
    }

    console.log(`\n🔍 Encontrados ${testUsers?.length || 0} usuarios de prueba en Supabase`);

    if (testUsers && testUsers.length > 0) {
      const testUserIds = testUsers.map(user => user.id);
      
      console.log('\n🗑️ Eliminando conductores de prueba...');
      
      // Eliminar conductores de prueba
      const { error: driverError } = await supabase
        .from('drivers')
        .delete()
        .in('user_id', testUserIds);

      if (driverError) {
        console.error('❌ Error eliminando conductores de prueba:', driverError);
      } else {
        console.log(`✅ Conductores de prueba eliminados`);
      }

      console.log('\n🗑️ Eliminando usuarios de prueba...');
      
      // Eliminar usuarios de prueba
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .in('firebase_uid', testUserUids);

      if (deleteError) {
        console.error('❌ Error eliminando usuarios de prueba:', deleteError);
      } else {
        console.log(`✅ Usuarios de prueba eliminados`);
      }
    }

    console.log('\n🎉 Limpieza completada');

    // Verificar usuarios restantes
    const { data: remainingUsers, error: remainingError } = await supabase
      .from('users')
      .select('*');

    if (remainingError) {
      console.error('❌ Error verificando usuarios restantes:', remainingError);
    } else {
      console.log(`\n📊 Usuarios restantes en Supabase: ${remainingUsers?.length || 0}`);
      remainingUsers?.forEach(user => {
        console.log(`  - ${user.display_name} (${user.role}) - ${user.firebase_uid}`);
      });
    }

    // Verificar conductores restantes
    const { data: remainingDrivers, error: driverRemainingError } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(display_name, firebase_uid, role)
      `);

    if (driverRemainingError) {
      console.error('❌ Error verificando conductores restantes:', driverRemainingError);
    } else {
      console.log(`\n🚗 Conductores restantes en Supabase: ${remainingDrivers?.length || 0}`);
      remainingDrivers?.forEach(driver => {
        console.log(`  - ${driver.user?.display_name} (${driver.user?.role}) - ${driver.user?.firebase_uid}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en limpieza:', error);
  }
}

cleanupTestUsers(); 