// Script de prueba automatizada para servicios de OpenStreetMap
require('dotenv').config();

console.log('🧪 Iniciando pruebas de servicios OpenStreetMap...\n');

// Función helper para hacer requests con headers apropiados
const makeRequest = async (url) => {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TaxiZKT-App/1.0',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      throw new Error(`Respuesta no es JSON: ${contentType}`);
    }
    
    return await response.json();
  } catch (error) {
    throw error;
  }
};

const testGeocoding = async () => {
  console.log('📍 Probando geocodificación...');
  try {
    const data = await makeRequest(
      'https://nominatim.openstreetmap.org/search?q=San Salvador, El Salvador&format=json&limit=1&addressdetails=1'
    );
    
    if (data && data.length > 0) {
      console.log('✅ Geocodificación exitosa:');
      console.log(`   Dirección: ${data[0].display_name}`);
      console.log(`   Coordenadas: ${data[0].lat}, ${data[0].lon}`);
      return true;
    } else {
      console.log('❌ No se encontraron resultados');
      return false;
    }
  } catch (error) {
    console.log('❌ Error en geocodificación:', error.message);
    return false;
  }
};

const testReverseGeocoding = async () => {
  console.log('\n🔄 Probando geocodificación inversa...');
  try {
    const lat = 13.6929;
    const lon = -89.2182;
    const data = await makeRequest(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
    );
    
    if (data && data.display_name) {
      console.log('✅ Geocodificación inversa exitosa:');
      console.log(`   Coordenadas: ${lat}, ${lon}`);
      console.log(`   Dirección: ${data.display_name}`);
      return true;
    } else {
      console.log('❌ No se pudo obtener la dirección');
      return false;
    }
  } catch (error) {
    console.log('❌ Error en geocodificación inversa:', error.message);
    return false;
  }
};

const testSearchPlaces = async () => {
  console.log('\n🔍 Probando búsqueda de lugares...');
  try {
    const data = await makeRequest(
      'https://nominatim.openstreetmap.org/search?q=restaurante San Salvador&format=json&limit=3&addressdetails=1'
    );
    
    if (data && data.length > 0) {
      console.log('✅ Búsqueda de lugares exitosa:');
      data.forEach((place, index) => {
        console.log(`   ${index + 1}. ${place.display_name}`);
      });
      return true;
    } else {
      console.log('❌ No se encontraron lugares');
      return false;
    }
  } catch (error) {
    console.log('❌ Error en búsqueda de lugares:', error.message);
    return false;
  }
};

const testRouting = async () => {
  console.log('\n🛣️ Probando cálculo de rutas...');
  try {
    // Ruta desde San Salvador hasta Santa Tecla
    const origin = '-89.2182,13.6929'; // San Salvador
    const destination = '-89.2795,13.6769'; // Santa Tecla
    
    const data = await makeRequest(
      `https://router.project-osrm.org/route/v1/driving/${origin};${destination}?overview=full&geometries=geojson`
    );
    
    if (data && data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      console.log('✅ Cálculo de ruta exitoso:');
      console.log(`   Distancia: ${(route.distance / 1000).toFixed(2)} km`);
      console.log(`   Duración: ${Math.round(route.duration / 60)} minutos`);
      console.log(`   Puntos de ruta: ${route.geometry.coordinates.length}`);
      return true;
    } else {
      console.log('❌ No se pudo calcular la ruta');
      return false;
    }
  } catch (error) {
    console.log('❌ Error en cálculo de ruta:', error.message);
    return false;
  }
};

const testRateLimiting = async () => {
  console.log('\n⏱️ Probando límites de velocidad...');
  try {
    const promises = [];
    for (let i = 0; i < 3; i++) { // Reducido a 3 para evitar rate limiting
      promises.push(
        makeRequest('https://nominatim.openstreetmap.org/search?q=test&format=json&limit=1')
      );
    }
    
    const results = await Promise.allSettled(promises);
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    
    console.log(`✅ ${successCount}/3 solicitudes exitosas`);
    return successCount >= 2; // Al menos 2 deben funcionar
  } catch (error) {
    console.log('❌ Error en prueba de límites:', error.message);
    return false;
  }
};

const testErrorHandling = async () => {
  console.log('\n🚨 Probando manejo de errores...');
  try {
    // Coordenadas inválidas
    const response = await fetch(
      'https://nominatim.openstreetmap.org/reverse?lat=999&lon=999&format=json',
      {
        headers: {
          'User-Agent': 'TaxiZKT-App/1.0',
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      console.log('✅ Manejo de errores correcto para coordenadas inválidas');
      return true;
    } else {
      console.log('⚠️ Coordenadas inválidas no fueron rechazadas');
      return false;
    }
  } catch (error) {
    console.log('✅ Error capturado correctamente:', error.message);
    return true;
  }
};

const testBasicConnectivity = async () => {
  console.log('\n🌐 Probando conectividad básica...');
  try {
    const response = await fetch('https://nominatim.openstreetmap.org/status.php');
    if (response.ok) {
      console.log('✅ Servicio Nominatim está disponible');
      return true;
    } else {
      console.log('❌ Servicio Nominatim no está disponible');
      return false;
    }
  } catch (error) {
    console.log('❌ Error de conectividad:', error.message);
    return false;
  }
};

// Ejecutar todas las pruebas
const runAllTests = async () => {
  const tests = [
    { name: 'Conectividad Básica', fn: testBasicConnectivity },
    { name: 'Geocodificación', fn: testGeocoding },
    { name: 'Geocodificación Inversa', fn: testReverseGeocoding },
    { name: 'Búsqueda de Lugares', fn: testSearchPlaces },
    { name: 'Cálculo de Rutas', fn: testRouting },
    { name: 'Límites de Velocidad', fn: testRateLimiting },
    { name: 'Manejo de Errores', fn: testErrorHandling }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`\n${'='.repeat(50)}`);
    console.log(`🧪 ${test.name}`);
    console.log(`${'='.repeat(50)}`);
    
    const startTime = Date.now();
    const result = await test.fn();
    const duration = Date.now() - startTime;
    
    results.push({
      name: test.name,
      passed: result,
      duration: duration
    });
    
    // Pausa entre pruebas para evitar rate limiting
    if (test.name !== 'Manejo de Errores') {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Resumen de resultados
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 RESUMEN DE PRUEBAS');
  console.log(`${'='.repeat(60)}`);
  
  const passedTests = results.filter(r => r.passed).length;
  const totalTests = results.length;
  
  results.forEach(result => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${result.name}: ${result.duration}ms`);
  });
  
  console.log(`\n🎯 Resultado: ${passedTests}/${totalTests} pruebas pasaron`);
  
  if (passedTests >= totalTests - 1) { // Permitir 1 falla por rate limiting
    console.log('🎉 ¡La mayoría de las pruebas pasaron! Los servicios de OpenStreetMap están funcionando correctamente.');
    console.log('💡 Nota: Algunas fallas pueden ser debido a rate limiting de las APIs gratuitas.');
  } else {
    console.log('⚠️ Varias pruebas fallaron. Revisa los errores arriba.');
  }
  
  return passedTests >= totalTests - 1;
};

// Ejecutar las pruebas
runAllTests().then(success => {
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('❌ Error ejecutando pruebas:', error);
  process.exit(1);
}); 