#!/usr/bin/env node

const { automationManager } = require('./scripts/setup-automation');

console.log('🤖 Iniciando Automatización de Taxi ZKT...\n');

// Configurar automatización
automationManager.setupAutomation()
  .then(() => {
    console.log('\n✅ Automatización iniciada exitosamente!');
    console.log('\n📋 Tareas programadas:');
    console.log('   • Limpieza semanal: Domingos 2:00 AM');
    console.log('   • Monitoreo diario: 8:00 AM');
    console.log('   • Backup semanal: Domingos 3:00 AM');
    console.log('   • Alertas: Cada hora');
    console.log('\n🖼️ Optimización de imágenes: Automática');
    console.log('📊 Monitoreo de espacio: Automático');
    console.log('🧹 Limpieza de datos: Automática');
    
    console.log('\n🚀 La automatización está funcionando en segundo plano.');
    console.log('💡 Presiona Ctrl+C para detener.');
    
    // Mantener el proceso corriendo
    process.on('SIGINT', () => {
      console.log('\n🛑 Deteniendo automatización...');
      automationManager.stopAutomation();
      console.log('✅ Automatización detenida.');
      process.exit(0);
    });
  })
  .catch((error) => {
    console.error('❌ Error iniciando automatización:', error);
    process.exit(1);
  }); 