const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateUserRole() {
  const firebaseUid = 'jbH43kh2FrYiBduwuaatkReA85o1';

  console.log(`🔄 Actualizando rol del usuario: ${firebaseUid}`);

  try {
    // Actualizar el rol del usuario a 'driver'
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({
        role: 'driver',
        display_name: 'Conductor Migrado'
      })
      .eq('firebase_uid', firebaseUid)
      .select()
      .single();

    if (userError) {
      console.error('❌ Error actualizando usuario:', userError);
      return;
    }

    console.log(`✅ Usuario actualizado: ${userData.display_name} - Rol: ${userData.role}`);

    // Crear perfil de conductor
    const driverData = {
      user_id: userData.id,
      is_available: true,
      status: 'active',
      location: {
        latitude: 13.7942 + (Math.random() - 0.5) * 0.01,
        longitude: -88.8965 + (Math.random() - 0.5) * 0.01
      },
      rating: 4.5 + Math.random() * 0.5,
      total_rides: Math.floor(Math.random() * 100) + 50,
      earnings: Math.floor(Math.random() * 1000) + 500,
      car_info: {
        model: 'Toyota Corolla',
        plate: 'MIG-001',
        year: 2020
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
      console.error('❌ Error creando conductor:', driverError);
    } else {
      console.log(`✅ Conductor creado para: ${userData.display_name}`);
      console.log(`   - Vehículo: ${driverData.car_info.model} ${driverData.car_info.year}`);
      console.log(`   - Placa: ${driverData.car_info.plate}`);
      console.log(`   - Calificación: ${driverData.rating.toFixed(1)}`);
      console.log(`   - Viajes: ${driverData.total_rides}`);
      console.log(`   - Ganancias: $${driverData.earnings.toFixed(2)}`);
    }

    // Verificar resultado final
    const { data: finalUser, error: finalError } = await supabase
      .from('users')
      .select(`
        *,
        driver:drivers(*)
      `)
      .eq('firebase_uid', firebaseUid)
      .single();

    if (finalError) {
      console.error('❌ Error verificando resultado:', finalError);
    } else {
      console.log('\n🎉 Migración completada exitosamente!');
      console.log(`📊 Usuario: ${finalUser.display_name}`);
      console.log(`📊 Rol: ${finalUser.role}`);
      console.log(`📊 Conductor: ${finalUser.driver ? 'Sí' : 'No'}`);
      if (finalUser.driver) {
        console.log(`📊 Disponible: ${finalUser.driver.is_available ? 'Sí' : 'No'}`);
        console.log(`📊 Estado: ${finalUser.driver.status}`);
        console.log(`📊 Vehículo: ${finalUser.driver.car_info?.model} ${finalUser.driver.car_info?.year}`);
      }
    }

  } catch (error) {
    console.error('❌ Error en migración:', error);
  }
}

updateUserRole(); 