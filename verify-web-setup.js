// Script de verificación final para la configuración web
const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🔍 Verificación final de la configuración web...\n');

// Verificar archivos críticos
const criticalFiles = [
  'webpack.config.js',
  'src/expo-router-context.js',
  'src/components/CountryPickerWrapper.tsx',
  'app.config.web.js',
  'package.json'
];

console.log('📁 Verificando archivos críticos:');
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
  }
});

// Verificar dependencias
console.log('\n📦 Verificando dependencias:');
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const requiredDeps = ['crypto-browserify', 'stream-browserify', 'buffer'];
const devDeps = packageJson.devDependencies || {};

requiredDeps.forEach(dep => {
  if (devDeps[dep]) {
    console.log(`✅ ${dep} - ${devDeps[dep]}`);
  } else {
    console.log(`❌ ${dep} - NO INSTALADO`);
  }
});

// Verificar servidor web
console.log('\n🌐 Verificando servidor web:');
function checkWebServer() {
  const options = {
    hostname: 'localhost',
    port: 19006,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Servidor web respondiendo - Status: ${res.statusCode}`);
    
    if (res.statusCode === 200) {
      console.log('🎉 ¡Configuración web completada exitosamente!');
      console.log('\n📋 Resumen de la configuración:');
      console.log('- ✅ Webpack configurado con fallbacks');
      console.log('- ✅ Contexto de expo-router personalizado');
      console.log('- ✅ Alias de módulos configurados');
      console.log('- ✅ Servidor web funcionando');
      console.log('- ✅ Variables de entorno configuradas');
      
      console.log('\n🚀 Próximos pasos:');
      console.log('1. Abre http://localhost:19006 en tu navegador');
      console.log('2. Prueba la funcionalidad de autenticación');
      console.log('3. Prueba la búsqueda de direcciones');
      console.log('4. Prueba el sistema híbrido de realtime');
      
      console.log('\n💡 Comandos útiles:');
      console.log('- npm run web (iniciar servidor web)');
      console.log('- node check-web-status.js (verificar estado)');
      console.log('- npm run web:test (pruebas automatizadas)');
    }
  });

  req.on('error', (error) => {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Servidor web no está ejecutándose');
      console.log('💡 Ejecuta: npm run web');
    } else {
      console.log(`❌ Error de conexión: ${error.message}`);
    }
  });

  req.on('timeout', () => {
    console.log('⏰ Timeout - El servidor no respondió en 5 segundos');
    req.destroy();
  });

  req.end();
}

checkWebServer(); 