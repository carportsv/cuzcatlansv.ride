// Script para verificar el estado de la aplicación web
const http = require('http');

console.log('🔍 Verificando estado de la aplicación web...\n');

function checkWebStatus() {
  const options = {
    hostname: 'localhost',
    port: 19006,
    path: '/',
    method: 'GET',
    timeout: 5000
  };

  const req = http.request(options, (res) => {
    console.log(`✅ Servidor web respondiendo - Status: ${res.statusCode}`);
    console.log(`📊 Headers: ${JSON.stringify(res.headers, null, 2)}`);
    
    if (res.statusCode === 200) {
      console.log('🎉 ¡Aplicación web funcionando correctamente!');
      console.log('🌐 Abre http://localhost:19006 en tu navegador');
    } else {
      console.log('⚠️ Servidor respondiendo pero con status inesperado');
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

checkWebStatus(); 