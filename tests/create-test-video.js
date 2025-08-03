const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🎬 Creando Video de Prueba - TaxiZKT\n');

// Verificar si FFmpeg está instalado
exec('ffmpeg -version', (error, stdout, stderr) => {
  if (error) {
    console.log('❌ FFmpeg no está instalado. Instalando alternativas...');
    createSimpleVideoAlternative();
    return;
  }
  
  console.log('✅ FFmpeg encontrado, creando video optimizado...');
  createOptimizedVideo();
});

function createOptimizedVideo() {
  const outputPath = path.join(__dirname, 'assets', 'videos', 'cuzcatlansv.ride.mp4');
  const backupPath = path.join(__dirname, 'assets', 'videos', 'cuzcatlansv.ride.backup.mp4');
  
  // Hacer backup del video actual
  if (fs.existsSync(outputPath)) {
    fs.copyFileSync(outputPath, backupPath);
    console.log('✅ Backup creado del video actual');
  }
  
  // Crear un video simple con FFmpeg
  const ffmpegCommand = `ffmpeg -f lavfi -i "color=c=#2563EB:size=720x1280:duration=3" -f lavfi -i "sine=frequency=1000:duration=3" -c:v libx264 -preset fast -crf 23 -c:a aac -b:a 128k -shortest "${outputPath}"`;
  
  console.log('🎬 Generando video de prueba...');
  exec(ffmpegCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('❌ Error creando video con FFmpeg:', error);
      createSimpleVideoAlternative();
      return;
    }
    
    console.log('✅ Video creado exitosamente');
    verifyVideo(outputPath);
  });
}

function createSimpleVideoAlternative() {
  console.log('📝 Creando video alternativo...');
  
  // Crear un video simple usando canvas (simulado)
  const videoContent = `
    <html>
    <head>
      <style>
        body { margin: 0; background: #2563EB; display: flex; justify-content: center; align-items: center; height: 100vh; }
        .logo { color: white; font-size: 48px; font-family: Arial; }
      </style>
    </head>
    <body>
      <div class="logo">CUZCATLANSV.RIDE</div>
    </body>
    </html>
  `;
  
  const htmlPath = path.join(__dirname, 'assets', 'videos', 'splash.html');
  fs.writeFileSync(htmlPath, videoContent);
  
  console.log('✅ Archivo HTML de splash creado como alternativa');
  console.log('💡 Considera convertir este HTML a video usando herramientas online');
}

function verifyVideo(videoPath) {
  if (fs.existsSync(videoPath)) {
    const stats = fs.statSync(videoPath);
    const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    console.log('✅ Video verificado:');
    console.log('📊 Tamaño:', fileSizeInMB, 'MB');
    console.log('📅 Creado:', stats.mtime);
    
    if (stats.size > 1024 * 1024) { // Más de 1MB
      console.log('✅ Video parece válido');
    } else {
      console.log('⚠️  Video aún muy pequeño, podría tener problemas');
    }
  } else {
    console.log('❌ Video no se creó correctamente');
  }
}

console.log('🎬 Proceso de creación de video iniciado...'); 