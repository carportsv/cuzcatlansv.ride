const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkUser() {
  const firebaseUid = 'jbH43kh2FrYiBduwuaatkReA85o1';

  console.log(`🔍 Verificando usuario: ${firebaseUid}`);

  try {
    // Verificar si el usuario existe
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid);

    if (userError) {
      console.error('❌ Error verificando usuario:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ Usuario no encontrado en Supabase');
      console.log('💡 El usuario debe autenticarse primero en la app para ser creado automáticamente');
    } else {
      console.log(`✅ Usuario encontrado: ${users[0].display_name}`);
      console.log(`📊 Rol: ${users[0].role}`);
      console.log(`📊 ID: ${users[0].id}`);
      console.log(`📊 Email: ${users[0].email}`);
      console.log(`📊 Teléfono: ${users[0].phone_number}`);
    }

    // Verificar conductores
    console.log('\n🔍 Verificando conductores...');
    const { data: drivers, error: driverError } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(display_name, phone_number)
      `);

    if (driverError) {
      console.error('❌ Error verificando conductores:', driverError);
    } else {
      console.log(`📊 Conductores encontrados: ${drivers?.length || 0}`);
      drivers?.forEach(driver => {
        console.log(`  - ${driver.user?.display_name} (${driver.car_info?.model} ${driver.car_info?.year})`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

checkUser(); 