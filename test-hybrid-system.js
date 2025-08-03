// Script de prueba para el Sistema Híbrido
const { realtimeService } = require('./src/services/realtimeService');

console.log('🧪 Iniciando pruebas del Sistema Híbrido...\n');

// Simular diferentes usuarios
const testUsers = [
  {
    id: 'user-active-1',
    context: { role: 'user', hasActiveRide: true, isSearching: false }
  },
  {
    id: 'driver-active-1', 
    context: { role: 'driver', hasActiveRide: true, isAvailable: false }
  },
  {
    id: 'driver-available-1',
    context: { role: 'driver', hasActiveRide: false, isAvailable: true }
  },
  {
    id: 'user-searching-1',
    context: { role: 'user', hasActiveRide: false, isSearching: true }
  },
  {
    id: 'user-inactive-1',
    context: { role: 'user', hasActiveRide: false, isSearching: false }
  }
];

async function testHybridSystem() {
  console.log('📊 Estado inicial:');
  let stats = realtimeService.realtimeManager.getStats();
  console.log(stats);
  console.log('');

  // Conectar usuarios uno por uno
  for (let i = 0; i < testUsers.length; i++) {
    const user = testUsers[i];
    console.log(`🔗 Conectando ${user.id}...`);
    
    await realtimeService.realtimeManager.connectUser(user.id, user.context);
    
    stats = realtimeService.realtimeManager.getStats();
    console.log(`   Estado después de conectar ${user.id}:`);
    console.log(`   - Conexiones activas: ${stats.activeConnections}/${stats.maxConnections}`);
    console.log(`   - Usuarios con polling: ${stats.pollingUsers}`);
    console.log(`   - Total usuarios: ${stats.totalUsers}`);
    console.log('');
    
    // Esperar un poco entre conexiones
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎯 Prueba de rebalanceo:');
  console.log('Desconectando usuario activo para liberar conexión...');
  realtimeService.realtimeManager.disconnectUser('user-active-1');
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Ejecutando rebalanceo...');
  await realtimeService.realtimeManager.rebalanceConnections();
  
  stats = realtimeService.realtimeManager.getStats();
  console.log('Estado después del rebalanceo:');
  console.log(stats);
  console.log('');

  console.log('🧹 Limpiando conexiones...');
  testUsers.forEach(user => {
    realtimeService.realtimeManager.disconnectUser(user.id);
  });
  
  stats = realtimeService.realtimeManager.getStats();
  console.log('Estado final:');
  console.log(stats);
  
  console.log('\n✅ Pruebas completadas!');
}

// Ejecutar pruebas
testHybridSystem().catch(console.error); 