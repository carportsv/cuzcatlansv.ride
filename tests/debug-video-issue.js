const fs = require('fs');
const path = require('path');

console.log('🔍 Diagnóstico del Problema del Video - TaxiZKT\n');

// Verificar archivo de video
const videoPath = path.join(__dirname, 'assets', 'videos', 'cuzcatlansv.ride.mp4');
console.log('📁 Verificando archivo de video...');

if (fs.existsSync(videoPath)) {
  const stats = fs.statSync(videoPath);
  const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log('✅ Archivo encontrado:', path.basename(videoPath));
  console.log('📊 Tamaño:', fileSizeInMB, 'MB');
  console.log('📅 Última modificación:', stats.mtime);
  
  if (stats.size > 1024 * 1024) {
    console.log('✅ Tamaño de video apropiado (> 1MB)');
  } else {
    console.log('⚠️  Video muy pequeño, podría estar corrupto');
  }
} else {
  console.log('❌ Archivo de video no encontrado');
}

// Verificar configuración de react-native-video
console.log('\n📱 Verificando react-native-video...');
const packageJson = require('./package.json');
const videoDependency = packageJson.dependencies['react-native-video'];

if (videoDependency) {
  console.log('✅ react-native-video instalado:', videoDependency);
} else {
  console.log('❌ react-native-video no encontrado');
}

// Verificar AndroidManifest.xml
console.log('\n🤖 Verificando AndroidManifest.xml...');
const androidManifestPath = path.join(__dirname, 'android', 'app', 'src', 'main', 'AndroidManifest.xml');

if (fs.existsSync(androidManifestPath)) {
  const manifestContent = fs.readFileSync(androidManifestPath, 'utf8');
  
  if (manifestContent.includes('android:hardwareAccelerated="true"')) {
    console.log('✅ Hardware acceleration habilitado');
  } else {
    console.log('❌ Hardware acceleration NO habilitado');
  }
  
  if (manifestContent.includes('android:largeHeap="true"')) {
    console.log('✅ Large heap habilitado');
  } else {
    console.log('❌ Large heap NO habilitado');
  }
} else {
  console.log('❌ AndroidManifest.xml no encontrado');
}

// Verificar componente SplashVideo
console.log('\n🎬 Verificando componente SplashVideo...');
const splashVideoPath = path.join(__dirname, 'app', 'components', 'SplashVideo.tsx');

if (fs.existsSync(splashVideoPath)) {
  const componentContent = fs.readFileSync(splashVideoPath, 'utf8');
  
  if (componentContent.includes('minBufferMs: 2000')) {
    console.log('✅ Buffer config corregido');
  } else {
    console.log('❌ Buffer config NO corregido');
  }
  
  if (componentContent.includes('bufferForPlaybackAfterRebufferMs: 2000')) {
    console.log('✅ Buffer config completo');
  } else {
    console.log('❌ Buffer config incompleto');
  }
  
  if (componentContent.includes('showFallback &&')) {
    console.log('✅ Fallback condicional implementado');
  } else {
    console.log('❌ Fallback condicional NO implementado');
  }
} else {
  console.log('❌ SplashVideo.tsx no encontrado');
}

// Recomendaciones
console.log('\n💡 Recomendaciones para solucionar el problema:');

console.log('1. 🔄 Reiniciar completamente:');
console.log('   - Cerrar Metro bundler');
console.log('   - Ejecutar: npx expo start --clear');
console.log('   - Reinstalar la app en el dispositivo');

console.log('\n2. 📱 Verificar en el dispositivo:');
console.log('   - Desinstalar la app completamente');
console.log('   - Reinstalar desde cero');
console.log('   - Verificar logs en tiempo real');

console.log('\n3. 🔧 Verificar logs específicos:');
console.log('   - Buscar: [SplashVideo] Iniciando carga del video...');
console.log('   - Buscar: [SplashVideo] Video cargado exitosamente');
console.log('   - Buscar: [SplashVideo] Video terminado correctamente');

console.log('\n4. 🎯 Si el problema persiste:');
console.log('   - Verificar que el video se reproduce en otros reproductores');
console.log('   - Comprobar formato del video (MP4, H.264)');
console.log('   - Considerar reemplazar el video');

console.log('\n🔍 Diagnóstico completado!'); 