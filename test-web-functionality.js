// Script de prueba para verificar la funcionalidad web
const puppeteer = require('puppeteer');

console.log('🧪 Probando funcionalidad web...\n');

async function testWebFunctionality() {
  let browser;
  
  try {
    console.log('🌐 Iniciando navegador...');
    browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 375, height: 667 } // Tamaño móvil
    });
    
    const page = await browser.newPage();
    
    console.log('📱 Navegando a la aplicación web...');
    await page.goto('http://localhost:19006', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    console.log('✅ Página cargada correctamente');
    
    // Verificar que la aplicación se carga
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Tomar una captura de pantalla
    await page.screenshot({ 
      path: './web-test-screenshot.png',
      fullPage: true 
    });
    
    console.log('📸 Captura de pantalla guardada como web-test-screenshot.png');
    
    // Verificar elementos básicos
    const title = await page.title();
    console.log(`📄 Título de la página: ${title}`);
    
    // Verificar que no hay errores en la consola
    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Esperar un poco para capturar errores
    await page.waitForTimeout(5000);
    
    if (consoleErrors.length > 0) {
      console.log('⚠️ Errores encontrados en la consola:');
      consoleErrors.forEach(error => console.log(`   - ${error}`));
    } else {
      console.log('✅ No se encontraron errores en la consola');
    }
    
    console.log('\n🎉 Prueba web completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante la prueba web:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 Sugerencia: Asegúrate de que la aplicación web esté ejecutándose en http://localhost:19006');
    }
    
    if (error.message.includes('timeout')) {
      console.log('💡 Sugerencia: La aplicación puede estar tardando en cargar. Intenta recargar la página.');
    }
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Ejecutar prueba
testWebFunctionality().catch(console.error); 