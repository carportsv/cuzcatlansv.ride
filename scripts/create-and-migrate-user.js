const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAndMigrateUser() {
  const firebaseUid = 'jbH43kh2FrYiBduwuaatkReA85o1';

  console.log(`🔍 Verificando usuario: ${firebaseUid}`);

  try {
    // 1. Verificar si el usuario existe
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', firebaseUid);

    if (userError) {
      console.error('❌ Error verificando usuario:', userError);
      return;
    }

    let userData;

    if (!existingUser || existingUser.length === 0) {
      console.log('❌ Usuario no encontrado en Supabase');
      console.log('📝 Creando usuario nuevo...');
      
      // Crear usuario nuevo
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          firebase_uid: firebaseUid,
          email: 'usuario@example.com',
          display_name: 'Usuario Migrado',
          phone_number: '+50370346370',
          role: 'driver'
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creando usuario:', createError);
        return;
      }

      userData = newUser;
      console.log(`✅ Usuario creado: ${userData.display_name}`);
      
    } else {
      userData = existingUser[0];
      console.log(`✅ Usuario encontrado: ${userData.display_name}`);
      console.log(`📊 Rol actual: ${userData.role}`);
      
      if (userData.role !== 'driver') {
        console.log('🔄 Actualizando rol a driver...');
        
        // Actualizar rol
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: 'driver' })
          .eq('firebase_uid', firebaseUid);

        if (updateError) {
          console.error('❌ Error actualizando rol:', updateError);
          return;
        }

        console.log('✅ Rol actualizado a driver');
        userData.role = 'driver';
      }
    }
    
    // 2. Verificar si ya tiene perfil de conductor
    const { data: existingDriver, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', userData.id);

    if (driverError) {
      console.error('❌ Error verificando conductor:', driverError);
      return;
    }

    if (!existingDriver || existingDriver.length === 0) {
      console.log('📝 Creando perfil de conductor...');
      
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

      const { error: createDriverError } = await supabase
        .from('drivers')
        .insert(driverData);

      if (createDriverError) {
        console.error('❌ Error creando conductor:', createDriverError);
      } else {
        console.log(`✅ Conductor creado para: ${userData.display_name}`);
        console.log(`   - Vehículo: ${driverData.car_info.model} ${driverData.car_info.year}`);
        console.log(`   - Placa: ${driverData.car_info.plate}`);
        console.log(`   - Calificación: ${driverData.rating.toFixed(1)}`);
        console.log(`   - Viajes: ${driverData.total_rides}`);
        console.log(`   - Ganancias: $${driverData.earnings.toFixed(2)}`);
      }
    } else {
      console.log('✅ Perfil de conductor ya existe');
    }

    // 3. Verificar resultado final
    console.log('\n🔍 Verificando resultado final...');
    
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

createAndMigrateUser(); 