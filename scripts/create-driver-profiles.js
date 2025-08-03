const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createDriverProfiles() {
  console.log('🚗 Creando perfiles de conductor para usuarios existentes...');

  try {
    // Obtener todos los usuarios con rol 'driver'
    const { data: drivers, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'driver');

    if (userError) {
      console.error('❌ Error obteniendo conductores:', userError);
      return;
    }

    console.log(`📊 Encontrados ${drivers?.length || 0} usuarios con rol 'driver'`);

    for (const driver of drivers || []) {
      console.log(`\n👤 Procesando conductor: ${driver.display_name}`);
      
      // Verificar si ya tiene perfil de conductor
      const { data: existingDriver, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', driver.id);

      if (driverError) {
        console.error(`❌ Error verificando conductor ${driver.display_name}:`, driverError);
        continue;
      }

      if (!existingDriver || existingDriver.length === 0) {
        console.log(`📝 Creando perfil de conductor para: ${driver.display_name}`);
        
        // Crear perfil de conductor
        const driverData = {
          user_id: driver.id,
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

        const { error: createError } = await supabase
          .from('drivers')
          .insert(driverData);

        if (createError) {
          console.error(`❌ Error creando conductor para ${driver.display_name}:`, createError);
        } else {
          console.log(`✅ Conductor creado para: ${driver.display_name}`);
          console.log(`   - Vehículo: ${driverData.car_info.model} ${driverData.car_info.year}`);
          console.log(`   - Placa: ${driverData.car_info.plate}`);
          console.log(`   - Calificación: ${driverData.rating.toFixed(1)}`);
        }
      } else {
        console.log(`✅ Perfil de conductor ya existe para: ${driver.display_name}`);
      }
    }

    console.log('\n🎉 Proceso completado');
    
    // Verificar conductores finales
    const { data: finalDrivers, error: finalError } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(display_name, phone_number, role)
      `);

    if (finalError) {
      console.error('❌ Error verificando conductores finales:', finalError);
    } else {
      console.log(`\n🚗 Total conductores en Supabase: ${finalDrivers?.length || 0}`);
      finalDrivers?.forEach(driver => {
        console.log(`  - ${driver.user?.display_name} (${driver.car_info?.model} ${driver.car_info?.year})`);
      });
    }

  } catch (error) {
    console.error('❌ Error en proceso:', error);
  }
}

createDriverProfiles(); 