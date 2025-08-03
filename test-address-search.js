// Script de prueba para la búsqueda de direcciones
const openStreetMapService = require('./src/services/openStreetMapService').default;

console.log('🧪 Probando búsqueda de direcciones...\n');

async function testAddressSearch() {
  const testQueries = [
    'San Salvador',
    '5800 preston',
    'Centro Comercial',
    'Aeropuerto',
    'Hospital'
  ];

  for (const query of testQueries) {
    console.log(`🔍 Probando: "${query}"`);
    
    try {
      const results = await openStreetMapService.searchPlaces(query);
      
      if (results && results.length > 0) {
        console.log(`✅ Encontrados ${results.length} resultados:`);
        results.slice(0, 3).forEach((result, index) => {
          console.log(`   ${index + 1}. ${result.display_name}`);
          console.log(`      Coordenadas: ${result.lat}, ${result.lon}`);
        });
      } else {
        console.log(`❌ No se encontraron resultados`);
      }
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('');
    
    // Esperar un poco entre búsquedas para no sobrecargar el servicio
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('✅ Pruebas de búsqueda completadas!');
}

testAddressSearch().catch(console.error); 