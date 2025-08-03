const fs = require('fs');
const path = require('path');

console.log('🎬 Diagnóstico de Video de Splash - TaxiZKT\n');

// Verificar si el archivo de video existe
const videoPath = path.join(__dirname, 'assets', 'videos', 'cuzcatlansv.ride.mp4');

console.log('📁 Verificando archivo de video...');
if (fs.existsSync(videoPath)) {
  const stats = fs.statSync(videoPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('✅ Archivo encontrado:', videoPath);
  console.log('📊 Tamaño:', fileSizeInMB, 'MB');
  console.log('📅 Última modificación:', stats.mtime);
  
  if (stats.size < 1024 * 1024) { // Menos de 1MB
    console.log('⚠️  El video es muy pequeño, podría estar corrupto');
  } else if (stats.size > 10 * 1024 * 1024) { // Más de 10MB
    console.log('⚠️  El video es muy grande, podría causar lentitud');
  } else {
    console.log('✅ Tamaño de video apropiado');
  }
} else {
  console.log('❌ Archivo de video no encontrado');
  process.exit(1);
}

// Verificar configuración de react-native-video
console.log('\n📱 Verificando configuración de react-native-video...');

const packageJson = require('./package.json');
const videoDependency = packageJson.dependencies['react-native-video'];

if (videoDependency) {
  console.log('✅ react-native-video instalado:', videoDependency);
} else {
  console.log('❌ react-native-video no encontrado en dependencies');
}

// Verificar configuración de Android
console.log('\n🤖 Verificando configuración de Android...');

const androidManifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');
if (fs.existsSync(androidManifestPath)) {
  const manifestContent = fs.readFileSync(androidManifestPath, 'utf8');
  
  if (manifestContent.includes('android:hardwareAccelerated="true"')) {
    console.log('✅ Hardware acceleration habilitado');
  } else {
    console.log('⚠️  Hardware acceleration no encontrado en AndroidManifest.xml');
  }
  
  if (manifestContent.includes('android:largeHeap="true"')) {
    console.log('✅ Large heap habilitado');
  } else {
    console.log('⚠️  Large heap no encontrado en AndroidManifest.xml');
  }
} else {
  console.log('❌ AndroidManifest.xml no encontrado');
}

// Recomendaciones
console.log('\n💡 Recomendaciones para mejorar el video:');

console.log('1. 🎯 Optimizar el video:');
console.log('   - Comprimir a H.264 con bitrate de 1-2 Mbps');
console.log('   - Resolución máxima: 720p');
console.log('   - Duración: 2-4 segundos');
console.log('   - Tamaño objetivo: < 2MB');

console.log('\n2. ⚡ Configuraciones de rendimiento:');
console.log('   - Usar bufferConfig optimizado');
console.log('   - Habilitar hardware acceleration');
console.log('   - Pre-cargar el video');

console.log('\n3. 🔧 Configuraciones de Android:');
console.log('   - Agregar android:hardwareAccelerated="true"');
console.log('   - Agregar android:largeHeap="true"');
console.log('   - Verificar permisos de internet');

console.log('\n4. 📊 Monitoreo:');
console.log('   - Revisar logs de [SplashVideo]');
console.log('   - Verificar tiempo de carga');
console.log('   - Monitorear uso de memoria');

console.log('\n🎬 Diagnóstico completado!'); 