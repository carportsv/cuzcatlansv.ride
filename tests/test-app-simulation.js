require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  console.log('💡 Asegúrate de tener un archivo .env con EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Simular DriverService.getAvailableDrivers
async function getAvailableDrivers(latitude, longitude, radiusKm = 5) {
  try {
    console.log('🚗 DriverService: Buscando conductores disponibles...');
    console.log('📍 Parámetros - lat:', latitude, 'lng:', longitude, 'radio:', radiusKm);
    
    const { data, error } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(display_name, phone_number, photo_url)
      `)
      .eq('is_available', true)
      .eq('status', 'active');

    if (error) {
      console.error('❌ DriverService: Error obteniendo conductores:', error);
      throw error;
    }

    console.log('✅ DriverService: Consulta ejecutada exitosamente');
    console.log(`📊 DriverService: Conductores encontrados: ${data?.length || 0}`);
    
    if (data && data.length > 0) {
      console.log('📋 DriverService: Detalles de conductores:');
      data.forEach((driver, index) => {
        console.log(`  Conductor ${index + 1}:`);
        console.log(`    ID: ${driver.id}`);
        console.log(`    Disponible: ${driver.is_available}`);
        console.log(`    Estado: ${driver.status}`);
        console.log(`    Ubicación: ${driver.location ? `${driver.location.latitude}, ${driver.location.longitude}` : 'N/A'}`);
        console.log(`    Usuario: ${driver.user?.display_name || 'N/A'}`);
      });
    } else {
      console.log('⚠️ DriverService: No se encontraron conductores disponibles');
    }
    
    return data || [];
  } catch (error) {
    console.error('❌ DriverService: Error en getAvailableDrivers:', error);
    throw error;
  }
}

// Simular RealtimeService.subscribeToDriverAvailability
function subscribeToDriverAvailability(callback) {
  console.log('🔗 Iniciando suscripción a cambios de disponibilidad de conductores...');
  
  const subscription = supabase
    .channel('driver_availability')
    .on(
      'postgres_changes',
      {
        event: '*', // INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'drivers'
      },
      async (payload) => {
        console.log('🔄 Cambio en disponibilidad de conductor detectado:', payload);
        console.log('📋 Tipo de evento:', payload.eventType);
        console.log('📋 Datos anteriores:', payload.old);
        console.log('📋 Datos nuevos:', payload.new);
        
        try {
          // Solo procesar cambios de disponibilidad
          if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
            const driver = payload.new;
            
            // Verificar si el cambio es relevante (disponibilidad o ubicación)
            if (driver.is_available !== undefined || driver.location) {
              console.log('✅ Procesando cambio relevante de conductor');
              
              // Obtener datos del usuario si no están incluidos
              let userData = driver.user;
              if (!userData && driver.user_id) {
                const { data: user, error: userError } = await supabase
                  .from('users')
                  .select('display_name, phone_number, photo_url')
                  .eq('id', driver.user_id)
                  .single();
                
                if (!userError && user) {
                  userData = user;
                }
              }
              
              callback({
                id: driver.id,
                is_available: driver.is_available,
                location: driver.location,
                status: driver.status,
                user: userData,
                car_info: driver.car_info,
                rating: driver.rating,
                eventType: payload.eventType
              });
            } else {
              console.log('⚠️ Cambio no relevante, ignorando');
            }
          } else if (payload.eventType === 'DELETE') {
            // Conductor eliminado o deshabilitado
            console.log('❌ Conductor eliminado:', payload.old.id);
            callback({
              id: payload.old.id,
              is_available: false,
              eventType: 'DELETE'
            });
          }
        } catch (error) {
          console.error('❌ Error procesando cambio de conductor:', error);
        }
      }
    )
    .subscribe((status) => {
      console.log('🔗 Estado de suscripción a conductores:', status);
      if (status === 'SUBSCRIBED') {
        console.log('✅ Suscripción a conductores activa y funcionando');
      } else if (status === 'CHANNEL_ERROR') {
        console.error('❌ Error en canal de suscripción a conductores');
      }
    });

  console.log('✅ Suscripción a disponibilidad de conductores iniciada');
  return subscription;
}

// Simular handleDriverAvailabilityUpdate
function handleDriverAvailabilityUpdate(driverUpdate) {
  console.log('🔄 Actualización en tiempo real de conductor:', driverUpdate);
  
  // Simular el estado de conductores disponibles
  let availableDrivers = [];
  
  if (driverUpdate.eventType === 'DELETE') {
    console.log(`❌ Conductor ${driverUpdate.id} removido (no disponible)`);
  } else if (driverUpdate.eventType === 'INSERT') {
    if (driverUpdate.is_available && driverUpdate.status === 'active') {
      console.log(`✅ Nuevo conductor ${driverUpdate.id} agregado`);
    }
  } else if (driverUpdate.eventType === 'UPDATE') {
    if (driverUpdate.is_available && driverUpdate.status === 'active') {
      console.log(`🔄 Conductor ${driverUpdate.id} actualizado`);
    } else {
      console.log(`❌ Conductor ${driverUpdate.id} removido (no disponible)`);
    }
  }
}

async function testAppSimulation() {
  console.log('🧪 Probando simulación de aplicación móvil...\n');

  try {
    // 1. Simular carga inicial de conductores (como hace la app)
    console.log('📱 PASO 1: Cargar conductores disponibles (simulación de app)');
    const initialDrivers = await getAvailableDrivers(13.7942, -88.8965, 10);
    console.log(`📊 Conductores iniciales: ${initialDrivers.length}\n`);

    // 2. Iniciar suscripción en tiempo real (como hace la app)
    console.log('📱 PASO 2: Iniciar suscripción en tiempo real (simulación de app)');
    const subscription = subscribeToDriverAvailability(handleDriverAvailabilityUpdate);
    
    // 3. Esperar un momento para que la suscripción se establezca
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 4. Simular cambio de disponibilidad
    console.log('\n📱 PASO 3: Simular cambio de disponibilidad (como haría un conductor)');
    
    // Buscar el conductor Fred Wicket
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', 'PO50dbcOFVTJoiA7MouHlnTEGAV2')
      .single();

    if (userError || !users) {
      console.error('❌ Error buscando usuario:', userError);
      return;
    }

    const { data: drivers, error: driverError } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', users.id)
      .single();

    if (driverError || !drivers) {
      console.error('❌ Error buscando conductor:', driverError);
      return;
    }

    // Cambiar disponibilidad a false
    console.log('🔄 Cambiando disponibilidad a false...');
    const { error: updateError } = await supabase
      .from('drivers')
      .update({
        is_available: false,
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', drivers.id);

    if (updateError) {
      console.error('❌ Error actualizando conductor:', updateError);
      return;
    }

    console.log('✅ Conductor actualizado a no disponible');

    // Esperar para ver la actualización en tiempo real
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Cambiar de vuelta a disponible
    console.log('\n🔄 Cambiando de vuelta a disponible...');
    const { error: updateError2 } = await supabase
      .from('drivers')
      .update({
        is_available: true,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', drivers.id);

    if (updateError2) {
      console.error('❌ Error actualizando conductor:', updateError2);
      return;
    }

    console.log('✅ Conductor actualizado a disponible');

    // Esperar para ver la actualización en tiempo real
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 5. Verificar estado final
    console.log('\n📱 PASO 4: Verificar estado final');
    const finalDrivers = await getAvailableDrivers(13.7942, -88.8965, 10);
    console.log(`📊 Conductores finales: ${finalDrivers.length}`);

    // 6. Limpiar suscripción
    console.log('\n🧹 Limpiando suscripción...');
    subscription.unsubscribe();
    console.log('✅ Suscripción limpiada');

  } catch (error) {
    console.error('❌ Error en simulación:', error);
  }
}

testAppSimulation().then(() => {
  console.log('\n🎉 Simulación completada');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error en simulación:', error);
  process.exit(1);
}); 