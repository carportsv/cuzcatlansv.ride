const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertTestDrivers() {
  console.log('🚀 Insertando conductores de prueba...');
  
  try {
    // Primero, crear usuarios de prueba
    const testUsers = [
      {
        firebase_uid: 'test_driver_1',
        email: 'carlos.mendoza@test.com',
        display_name: 'Carlos Mendoza',
        phone_number: '+503 7123-4567',
        role: 'driver'
      },
      {
        firebase_uid: 'test_driver_2',
        email: 'maria.lopez@test.com',
        display_name: 'María López',
        phone_number: '+503 7123-4568',
        role: 'driver'
      },
      {
        firebase_uid: 'test_driver_3',
        email: 'juan.perez@test.com',
        display_name: 'Juan Pérez',
        phone_number: '+503 7123-4569',
        role: 'driver'
      }
    ];

    // Insertar usuarios
    for (const user of testUsers) {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .upsert(user, { onConflict: 'firebase_uid' })
        .select()
        .single();

      if (userError) {
        console.error(`Error insertando usuario ${user.display_name}:`, userError);
        continue;
      }

      console.log(`✅ Usuario creado: ${user.display_name}`);

      // Crear conductor para este usuario
      const driverData = {
        user_id: userData.id,
        is_available: true,
        status: 'active',
        location: {
          latitude: 13.7942 + (Math.random() - 0.5) * 0.01,
          longitude: -88.8965 + (Math.random() - 0.5) * 0.01
        },
        rating: 4.5 + Math.random() * 0.5, // 4.5 - 5.0
        total_rides: Math.floor(Math.random() * 100) + 50,
        earnings: Math.floor(Math.random() * 1000) + 500,
        car_info: {
          model: ['Toyota Corolla', 'Honda Civic', 'Nissan Sentra'][Math.floor(Math.random() * 3)],
          plate: ['ABC-123', 'XYZ-789', 'DEF-456'][Math.floor(Math.random() * 3)],
          year: 2019 + Math.floor(Math.random() * 3)
        },
        documents: {
          license: 'LIC-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          insurance: 'INS-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
          registration: 'REG-' + Math.random().toString(36).substr(2, 8).toUpperCase()
        }
      };

      const { error: driverError } = await supabase
        .from('drivers')
        .upsert(driverData, { onConflict: 'user_id' });

      if (driverError) {
        console.error(`Error insertando conductor para ${user.display_name}:`, driverError);
      } else {
        console.log(`✅ Conductor creado: ${user.display_name}`);
      }
    }

    console.log('🎉 Conductores de prueba insertados correctamente');
    
    // Verificar conductores
    const { data: drivers, error } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(display_name, phone_number)
      `)
      .eq('is_available', true);

    if (error) {
      console.error('Error verificando conductores:', error);
    } else {
      console.log(`📊 Conductores disponibles: ${drivers?.length || 0}`);
      drivers?.forEach(driver => {
        console.log(`  - ${driver.user?.display_name} (${driver.car_info?.model} ${driver.car_info?.year})`);
      });
    }

  } catch (error) {
    console.error('❌ Error insertando conductores de prueba:', error);
  }
}

insertTestDrivers(); 