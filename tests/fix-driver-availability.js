require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  console.log('💡 Asegúrate de tener un archivo .env con SUPABASE_URL y SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDriverAvailability() {
  console.log('🔧 Verificando y corrigiendo disponibilidad de conductores...\n');

  try {
    // Buscar el conductor Fred Wicket
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, display_name, email, firebase_uid')
      .eq('firebase_uid', 'PO50dbcOFVTJoiA7MouHlnTEGAV2');

    if (userError) {
      console.error('❌ Error buscando usuario:', userError);
      return;
    }

    if (!users || users.length === 0) {
      console.log('❌ No se encontró el usuario Fred Wicket');
      return;
    }

    const user = users[0];
    console.log(`✅ Usuario encontrado: ${user.display_name} (${user.email})`);

    // Buscar el conductor asociado
    const { data: drivers, error: driverError } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', user.id);

    if (driverError) {
      console.error('❌ Error buscando conductor:', driverError);
      return;
    }

    if (!drivers || drivers.length === 0) {
      console.log('❌ No se encontró registro de conductor para Fred Wicket');
      console.log('🛠️ Creando registro de conductor...');
      
      const { data: newDriver, error: createError } = await supabase
        .from('drivers')
        .insert({
          user_id: user.id,
          is_available: true,
          status: 'active',
          location: {
            latitude: 32.9342245,
            longitude: -96.8075848
          },
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
          rating: 4.5,
          total_rides: 50,
          earnings: 500
        })
        .select()
        .single();

      if (createError) {
        console.error('❌ Error creando conductor:', createError);
        return;
      }

      console.log('✅ Conductor creado exitosamente');
      console.log('📋 Datos del conductor:', newDriver);
    } else {
      const driver = drivers[0];
      console.log(`✅ Conductor encontrado: ID ${driver.id}`);
      console.log(`📋 Estado actual: disponible=${driver.is_available}, status=${driver.status}`);

      // Actualizar disponibilidad
      const { data: updatedDriver, error: updateError } = await supabase
        .from('drivers')
        .update({
          is_available: true,
          status: 'active',
          location: {
            latitude: 32.9342245,
            longitude: -96.8075848
          },
          updated_at: new Date().toISOString()
        })
        .eq('id', driver.id)
        .select()
        .single();

      if (updateError) {
        console.error('❌ Error actualizando conductor:', updateError);
        return;
      }

      console.log('✅ Conductor actualizado exitosamente');
      console.log('📋 Nuevo estado: disponible=true, status=active');
      console.log('📍 Nueva ubicación: 32.9342245, -96.8075848');
    }

    // Verificar estado final
    console.log('\n🔍 Verificando estado final...');
    const { data: finalDrivers, error: finalError } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(display_name, email)
      `)
      .eq('is_available', true)
      .eq('status', 'active');

    if (finalError) {
      console.error('❌ Error verificando estado final:', finalError);
      return;
    }

    console.log(`✅ Conductores disponibles: ${finalDrivers?.length || 0}`);
    if (finalDrivers && finalDrivers.length > 0) {
      finalDrivers.forEach((driver, index) => {
        console.log(`  Conductor ${index + 1}: ${driver.user?.display_name} - ${driver.car_info?.model}`);
      });
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

fixDriverAvailability(); 