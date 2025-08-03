const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://your-project.supabase.co'; // Reemplaza con tu URL
const supabaseKey = 'your-anon-key'; // Reemplaza con tu key
const supabase = createClient(supabaseUrl, supabaseKey);

// ID del conductor (del log anterior)
const DRIVER_ID = '3d8b3a72-419f-481d-9dd3-9805869fb942';

async function assignRidesToDriver() {
  try {
    console.log('🔄 Asignando viajes al conductor:', DRIVER_ID);
    
    // Obtener viajes que no tienen conductor asignado
    const { data: unassignedRides, error: fetchError } = await supabase
      .from('ride_requests')
      .select('*')
      .is('driver_id', null)
      .limit(3);
    
    if (fetchError) {
      console.error('❌ Error al obtener viajes:', fetchError);
      return;
    }
    
    console.log(`📋 Encontrados ${unassignedRides.length} viajes sin asignar`);
    
    // Asignar los viajes al conductor
    for (const ride of unassignedRides) {
      const { error: updateError } = await supabase
        .from('ride_requests')
        .update({ 
          driver_id: DRIVER_ID,
          status: 'completed' // Cambiar a completado para que aparezca en historial
        })
        .eq('id', ride.id);
      
      if (updateError) {
        console.error(`❌ Error al asignar viaje ${ride.id}:`, updateError);
      } else {
        console.log(`✅ Viaje ${ride.id} asignado al conductor`);
      }
    }
    
    console.log('🎉 Proceso completado');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
assignRidesToDriver(); 