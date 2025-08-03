const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function monitorUsage() {
  try {
    console.log('📊 Monitoreando uso de Supabase...\n');

    // 1. CONTEO DE REGISTROS POR TABLA
    const tables = ['users', 'drivers', 'ride_requests', 'ride_history', 'notifications'];
    
    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error(`❌ Error contando ${table}:`, error);
      } else {
        console.log(`📋 ${table}: ${count} registros`);
      }
    }

    // 2. USUARIOS ACTIVOS (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: activeUsers, error: activeError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', thirtyDaysAgo.toISOString());

    if (activeError) {
      console.error('❌ Error contando usuarios activos:', activeError);
    } else {
      console.log(`👥 Usuarios activos (30 días): ${activeUsers}`);
    }

    // 3. VIAJES RECIENTES (últimos 7 días)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { count: recentRides, error: ridesError } = await supabase
      .from('ride_requests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', sevenDaysAgo.toISOString());

    if (ridesError) {
      console.error('❌ Error contando viajes recientes:', ridesError);
    } else {
      console.log(`🚗 Viajes recientes (7 días): ${recentRides}`);
    }

    // 4. CONDUCTORES DISPONIBLES
    const { count: availableDrivers, error: driversError } = await supabase
      .from('drivers')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true);

    if (driversError) {
      console.error('❌ Error contando conductores disponibles:', driversError);
    } else {
      console.log(`🚘 Conductores disponibles: ${availableDrivers}`);
    }

    // 5. ESTIMACIÓN DE ESPACIO
    console.log('\n📈 Estimación de Espacio:');
    console.log('─'.repeat(50));
    
    const estimatedSpace = {
      users: activeUsers * 0.001, // ~1KB por usuario
      rides: recentRides * 0.002, // ~2KB por viaje
      drivers: availableDrivers * 0.001, // ~1KB por conductor
      total: 0
    };

    estimatedSpace.total = estimatedSpace.users + estimatedSpace.rides + estimatedSpace.drivers;

    console.log(`👥 Usuarios: ${estimatedSpace.users.toFixed(2)} MB`);
    console.log(`🚗 Viajes: ${estimatedSpace.rides.toFixed(2)} MB`);
    console.log(`🚘 Conductores: ${estimatedSpace.drivers.toFixed(2)} MB`);
    console.log(`📊 Total estimado: ${estimatedSpace.total.toFixed(2)} MB`);
    console.log(`💾 Límite Supabase: 500 MB`);
    console.log(`📊 Uso estimado: ${((estimatedSpace.total / 500) * 100).toFixed(1)}%`);

    // 6. RECOMENDACIONES
    console.log('\n💡 Recomendaciones:');
    console.log('─'.repeat(50));

    if (estimatedSpace.total > 400) {
      console.log('⚠️  Espacio crítico (>80%). Considerar:');
      console.log('   • Limpiar datos antiguos');
      console.log('   • Optimizar imágenes');
      console.log('   • Migrar a plan Pro');
    } else if (estimatedSpace.total > 300) {
      console.log('⚠️  Espacio moderado (>60%). Considerar:');
      console.log('   • Limpiar viajes antiguos');
      console.log('   • Comprimir imágenes');
    } else {
      console.log('✅ Espacio saludable. Continuar monitoreando.');
    }

    // 7. PRÓXIMA LIMPIEZA
    console.log('\n🧹 Próxima Limpieza Automática:');
    console.log('─'.repeat(50));
    console.log('📅 Viajes > 6 meses: Automático');
    console.log('📅 Usuarios inactivos > 1 año: Automático');
    console.log('📅 Notificaciones > 1 mes: Automático');

  } catch (error) {
    console.error('❌ Error en monitoreo:', error);
  }
}

// Ejecutar monitoreo
monitorUsage(); 