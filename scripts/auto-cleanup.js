const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function autoCleanup() {
  try {
    console.log('🧹 Iniciando limpieza automática...\n');

    const results = {
      ridesDeleted: 0,
      usersDeleted: 0,
      notificationsDeleted: 0,
      locationsCleared: 0
    };

    // 1. LIMPIAR VIAJES ANTIGUOS (> 6 meses)
    console.log('🚗 Limpiando viajes antiguos...');
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: oldRides, error: ridesError } = await supabase
      .from('ride_requests')
      .delete()
      .lt('created_at', sixMonthsAgo.toISOString())
      .in('status', ['completed', 'cancelled'])
      .select('id');

    if (ridesError) {
      console.error('❌ Error limpiando viajes:', ridesError);
    } else {
      results.ridesDeleted = oldRides?.length || 0;
      console.log(`✅ ${results.ridesDeleted} viajes antiguos eliminados`);
    }

    // 2. LIMPIAR USUARIOS INACTIVOS (> 1 año)
    console.log('👥 Limpiando usuarios inactivos...');
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const { data: inactiveUsers, error: usersError } = await supabase
      .from('users')
      .delete()
      .lt('last_login', oneYearAgo.toISOString())
      .eq('role', 'user') // No eliminar conductores automáticamente
      .select('id');

    if (usersError) {
      console.error('❌ Error limpiando usuarios:', usersError);
    } else {
      results.usersDeleted = inactiveUsers?.length || 0;
      console.log(`✅ ${results.usersDeleted} usuarios inactivos eliminados`);
    }

    // 3. LIMPIAR NOTIFICACIONES ANTIGUAS (> 1 mes)
    console.log('🔔 Limpiando notificaciones antiguas...');
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { data: oldNotifications, error: notificationsError } = await supabase
      .from('notifications')
      .delete()
      .lt('created_at', oneMonthAgo.toISOString())
      .select('id');

    if (notificationsError) {
      console.error('❌ Error limpiando notificaciones:', notificationsError);
    } else {
      results.notificationsDeleted = oldNotifications?.length || 0;
      console.log(`✅ ${results.notificationsDeleted} notificaciones antiguas eliminadas`);
    }

    // 4. LIMPIAR UBICACIONES ANTIGUAS DE CONDUCTORES (> 1 día)
    console.log('📍 Limpiando ubicaciones antiguas...');
    const oneDayAgo = new Date();
    oneDayAgo.setDate(oneDayAgo.getDate() - 1);

    const { data: clearedLocations, error: locationsError } = await supabase
      .from('drivers')
      .update({ location: null })
      .lt('updated_at', oneDayAgo.toISOString())
      .eq('is_available', false)
      .select('id');

    if (locationsError) {
      console.error('❌ Error limpiando ubicaciones:', locationsError);
    } else {
      results.locationsCleared = clearedLocations?.length || 0;
      console.log(`✅ ${results.locationsCleared} ubicaciones antiguas limpiadas`);
    }

    // 5. RESUMEN DE LIMPIEZA
    console.log('\n📊 Resumen de Limpieza:');
    console.log('─'.repeat(50));
    console.log(`🚗 Viajes eliminados: ${results.ridesDeleted}`);
    console.log(`👥 Usuarios eliminados: ${results.usersDeleted}`);
    console.log(`🔔 Notificaciones eliminadas: ${results.notificationsDeleted}`);
    console.log(`📍 Ubicaciones limpiadas: ${results.locationsCleared}`);
    
    const totalCleaned = results.ridesDeleted + results.usersDeleted + 
                        results.notificationsDeleted + results.locationsCleared;
    
    console.log(`📊 Total de registros limpiados: ${totalCleaned}`);

    // 6. ESTIMACIÓN DE ESPACIO LIBERADO
    const estimatedSpaceFreed = (
      results.ridesDeleted * 0.002 + // ~2KB por viaje
      results.usersDeleted * 0.001 + // ~1KB por usuario
      results.notificationsDeleted * 0.0005 // ~0.5KB por notificación
    );

    console.log(`💾 Espacio estimado liberado: ${estimatedSpaceFreed.toFixed(2)} MB`);

    // 7. PROGRAMAR PRÓXIMA LIMPIEZA
    const nextCleanup = new Date();
    nextCleanup.setDate(nextCleanup.getDate() + 7); // Cada semana

    console.log(`📅 Próxima limpieza automática: ${nextCleanup.toLocaleDateString()}`);

    return {
      success: true,
      results,
      spaceFreed: estimatedSpaceFreed,
      nextCleanup: nextCleanup.toISOString()
    };

  } catch (error) {
    console.error('❌ Error en limpieza automática:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para programar limpieza automática
function scheduleAutoCleanup() {
  // Ejecutar limpieza cada semana
  const interval = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos
  
  setInterval(async () => {
    console.log('⏰ Ejecutando limpieza automática programada...');
    await autoCleanup();
  }, interval);

  console.log('✅ Limpieza automática programada (cada 7 días)');
}

// Exportar funciones
module.exports = {
  autoCleanup,
  scheduleAutoCleanup
};

// Si se ejecuta directamente
if (require.main === module) {
  autoCleanup();
} 