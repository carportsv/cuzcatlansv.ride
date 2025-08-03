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

async function testRealtimeSubscription() {
  console.log('🧪 Probando suscripción en tiempo real...\n');

  try {
    // 1. Verificar estado inicial
    console.log('📊 Estado inicial de conductores:');
    const { data: initialDrivers, error: initialError } = await supabase
      .from('drivers')
      .select(`
        id,
        is_available,
        status,
        user:users(display_name)
      `)
      .eq('is_available', true)
      .eq('status', 'active');

    if (initialError) {
      console.error('❌ Error obteniendo conductores iniciales:', initialError);
      return;
    }

    console.log(`✅ Conductores disponibles inicialmente: ${initialDrivers?.length || 0}`);

    // 2. Iniciar suscripción
    console.log('\n🔗 Iniciando suscripción en tiempo real...');
    
    const subscription = supabase
      .channel('test_driver_availability')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivers'
        },
        (payload) => {
          console.log('🔄 Cambio detectado en tiempo real:');
          console.log('  Tipo:', payload.eventType);
          console.log('  ID:', payload.new?.id || payload.old?.id);
          console.log('  Disponible:', payload.new?.is_available);
          console.log('  Estado:', payload.new?.status);
          console.log('  Timestamp:', new Date().toISOString());
        }
      )
      .subscribe((status) => {
        console.log('🔗 Estado de suscripción:', status);
      });

    // 3. Esperar un momento para que la suscripción se establezca
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Simular cambio de disponibilidad
    console.log('\n🔄 Simulando cambio de disponibilidad...');
    
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

    // Cambiar disponibilidad
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

    // 5. Esperar para ver si se recibe el cambio
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 6. Cambiar de vuelta a disponible
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

    // 7. Esperar para ver si se recibe el cambio
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 8. Verificar estado final
    console.log('\n📊 Estado final de conductores:');
    const { data: finalDrivers, error: finalError } = await supabase
      .from('drivers')
      .select(`
        id,
        is_available,
        status,
        user:users(display_name)
      `)
      .eq('is_available', true)
      .eq('status', 'active');

    if (finalError) {
      console.error('❌ Error obteniendo conductores finales:', finalError);
      return;
    }

    console.log(`✅ Conductores disponibles al final: ${finalDrivers?.length || 0}`);

    // 9. Limpiar suscripción
    supabase.removeChannel(subscription);
    console.log('\n🧹 Suscripción limpiada');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

testRealtimeSubscription(); 