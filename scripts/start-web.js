const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando aplicación web...');

try {
  // Verificar que estamos en el directorio correcto
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const fs = require('fs');
  
  if (!fs.existsSync(packageJsonPath)) {
    throw new Error('No se encontró package.json. Asegúrate de estar en el directorio raíz del proyecto.');
  }

  // Ejecutar el comando web
  console.log('📦 Ejecutando: npm run web');
  execSync('npm run web', { 
    stdio: 'inherit',
    cwd: process.cwd()
  });

} catch (error) {
  console.error('❌ Error al iniciar la aplicación web:', error.message);
  
  if (error.message.includes('webpack')) {
    console.log('💡 Sugerencia: Intenta ejecutar "npm install" para asegurar que todas las dependencias estén instaladas.');
  }
  
  if (error.message.includes('port')) {
    console.log('💡 Sugerencia: El puerto 8081 puede estar en uso. Intenta cerrar otras instancias de Expo.');
  }
  
  process.exit(1);
} 