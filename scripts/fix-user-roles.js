const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixUserRoles() {
  console.log('🔧 Arreglando roles de usuario...');

  try {
    // Tu usuario debe ser driver para que funcione la app
    const yourUserId = 'jbH43kh2FrYiBduwuaatkReA85o1';
    
    console.log(`\n👤 Actualizando tu usuario (${yourUserId}) de admin a driver...`);
    
    const { data: yourUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', yourUserId);

    if (userError) {
      console.error('❌ Error obteniendo tu usuario:', userError);
      return;
    }

    if (!yourUser || yourUser.length === 0) {
      console.error('❌ Tu usuario no encontrado en Supabase');
      return;
    }

    const user = yourUser[0];
    console.log(`   Usuario actual: ${user.display_name} (${user.role})`);

    if (user.role !== 'driver') {
      console.log(`🔄 Cambiando rol de ${user.role} a driver...`);
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'driver' })
        .eq('firebase_uid', yourUserId);

      if (updateError) {
        console.error('❌ Error actualizando rol:', updateError);
      } else {
        console.log('✅ Rol actualizado a driver');
        
        // Crear perfil de conductor si no existe
        const { data: existingDriver, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('user_id', user.id);

        if (driverError) {
          console.error('❌ Error verificando conductor:', driverError);
        } else if (!existingDriver || existingDriver.length === 0) {
          console.log('📝 Creando perfil de conductor...');
          
          const driverData = {
            user_id: user.id,
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
              model: 'Honda Civic',
              plate: 'ABC-123',
              year: 2021
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
            console.log('✅ Perfil de conductor creado');
          }
        } else {
          console.log('✅ Perfil de conductor ya existe');
        }
      }
    } else {
      console.log('✅ Tu usuario ya tiene rol driver');
    }

    // Verificar usuarios con email vacío y arreglarlos
    console.log('\n📧 Arreglando usuarios con email vacío...');
    
    const { data: usersWithEmptyEmail, error: emptyEmailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', '');

    if (emptyEmailError) {
      console.error('❌ Error obteniendo usuarios con email vacío:', emptyEmailError);
    } else if (usersWithEmptyEmail && usersWithEmptyEmail.length > 0) {
      console.log(`📋 Encontrados ${usersWithEmptyEmail.length} usuarios con email vacío`);
      
      for (const user of usersWithEmptyEmail) {
        console.log(`   - ${user.display_name} (${user.firebase_uid})`);
        
        // Generar email único basado en el UID
        const uniqueEmail = `user_${user.firebase_uid.substring(0, 8)}@temp.com`;
        
        const { error: updateEmailError } = await supabase
          .from('users')
          .update({ email: uniqueEmail })
          .eq('id', user.id);

        if (updateEmailError) {
          console.error(`   ❌ Error actualizando email para ${user.display_name}:`, updateEmailError);
        } else {
          console.log(`   ✅ Email actualizado: ${uniqueEmail}`);
        }
      }
    }

    console.log('\n🎉 Arreglos completados');
    
    // Verificar estado final
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*');

    if (finalError) {
      console.error('❌ Error verificando usuarios finales:', finalError);
    } else {
      console.log(`\n📊 Estado final de usuarios en Supabase: ${finalUsers?.length || 0}`);
      finalUsers?.forEach(user => {
        console.log(`  - ${user.display_name} (${user.role}) - ${user.firebase_uid} - ${user.email}`);
      });
    }

    // Verificar conductores
    const { data: finalDrivers, error: driverFinalError } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(display_name, firebase_uid, role)
      `);

    if (driverFinalError) {
      console.error('❌ Error verificando conductores finales:', driverFinalError);
    } else {
      console.log(`\n🚗 Conductores finales en Supabase: ${finalDrivers?.length || 0}`);
      finalDrivers?.forEach(driver => {
        console.log(`  - ${driver.user?.display_name} (${driver.user?.role}) - ${driver.user?.firebase_uid}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en arreglos:', error);
  }
}

fixUserRoles(); 