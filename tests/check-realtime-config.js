require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRealtimeConfig() {
  console.log('🔍 Verificando configuración de Realtime en Supabase...\n');

  try {
    // 1. Verificar si la tabla drivers está en la publicación de Realtime
    console.log('📋 PASO 1: Verificar publicación de Realtime...');
    const { data: publicationData, error: publicationError } = await supabase
      .rpc('get_realtime_publication_tables');

    if (publicationError) {
      console.log('⚠️ No se pudo verificar publicación directamente, intentando método alternativo...');
      
      // Intentar verificar con una consulta SQL directa
      const { data: tablesData, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_name', 'drivers');

      if (tablesError) {
        console.error('❌ Error verificando tabla drivers:', tablesError);
      } else {
        console.log('✅ Tabla drivers existe en el esquema público');
      }
    } else {
      console.log('📊 Tablas en publicación de Realtime:', publicationData);
    }

    // 2. Verificar si hay triggers en la tabla drivers
    console.log('\n📋 PASO 2: Verificar triggers en tabla drivers...');
    const { data: triggersData, error: triggersError } = await supabase
      .from('information_schema.triggers')
      .select('trigger_name, event_manipulation, action_timing')
      .eq('event_object_table', 'drivers');

    if (triggersError) {
      console.error('❌ Error verificando triggers:', triggersError);
    } else {
      console.log('📊 Triggers en tabla drivers:', triggersData);
    }

    // 3. Verificar configuración de RLS
    console.log('\n📋 PASO 3: Verificar RLS en tabla drivers...');
    const { data: rlsData, error: rlsError } = await supabase
      .from('information_schema.tables')
      .select('is_insertable_into, is_updatable, is_deletable')
      .eq('table_schema', 'public')
      .eq('table_name', 'drivers')
      .single();

    if (rlsError) {
      console.error('❌ Error verificando RLS:', rlsError);
    } else {
      console.log('📊 Configuración de tabla drivers:', rlsData);
    }

    // 4. Probar suscripción con logs más detallados
    console.log('\n📋 PASO 4: Probar suscripción con logs detallados...');
    
    const subscription = supabase
      .channel('test_detailed')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'drivers'
        },
        (payload) => {
          console.log('🎉 EVENTO RECIBIDO EN TIEMPO REAL:');
          console.log('  Tipo:', payload.eventType);
          console.log('  ID:', payload.new?.id || payload.old?.id);
          console.log('  Disponible:', payload.new?.is_available);
          console.log('  Estado:', payload.new?.status);
          console.log('  Timestamp:', new Date().toISOString());
          console.log('  Payload completo:', JSON.stringify(payload, null, 2));
        }
      )
      .subscribe((status) => {
        console.log('🔗 Estado de suscripción detallada:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Suscripción detallada activa');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Error en canal detallado');
        } else if (status === 'TIMED_OUT') {
          console.error('⏰ Timeout en suscripción detallada');
        } else if (status === 'CLOSED') {
          console.log('🔌 Suscripción detallada cerrada');
        }
      });

    // 5. Esperar un momento y hacer un cambio
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Buscar conductor para hacer cambio
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('firebase_uid', 'PO50dbcOFVTJoiA7MouHlnTEGAV2')
      .single();

    if (userError || !users) {
      console.error('❌ Error buscando usuario:', userError);
      subscription.unsubscribe();
      return;
    }

    const { data: drivers, error: driverError } = await supabase
      .from('drivers')
      .select('id')
      .eq('user_id', users.id)
      .single();

    if (driverError || !drivers) {
      console.error('❌ Error buscando conductor:', driverError);
      subscription.unsubscribe();
      return;
    }

    console.log('\n🔄 Haciendo cambio de prueba...');
    const { error: updateError } = await supabase
      .from('drivers')
      .update({
        updated_at: new Date().toISOString()
      })
      .eq('id', drivers.id);

    if (updateError) {
      console.error('❌ Error haciendo cambio de prueba:', updateError);
    } else {
      console.log('✅ Cambio de prueba realizado');
    }

    // 6. Esperar para ver si llega el evento
    await new Promise(resolve => setTimeout(resolve, 3000));

    // 7. Limpiar
    subscription.unsubscribe();

    console.log('\n📋 RESUMEN:');
    console.log('- Si no viste "EVENTO RECIBIDO EN TIEMPO REAL", Realtime no está funcionando');
    console.log('- Verifica en Supabase Dashboard > Database > Replication que esté habilitado');
    console.log('- Verifica que la tabla drivers esté incluida en la publicación');

  } catch (error) {
    console.error('❌ Error en verificación:', error);
  }
}

checkRealtimeConfig().then(() => {
  console.log('\n🎉 Verificación completada');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error en verificación:', error);
  process.exit(1);
}); 