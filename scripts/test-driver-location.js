const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: Faltan las variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testDriverLocationUpdate() {
  try {
    console.log('🧪 Probando actualización de ubicación del conductor...');
    
    // ID del conductor del viaje activo
    const driverId = '3d8b3a72-419f-481d-9dd3-9805869fb942';
    
    // Ubicación de prueba (cerca de Dallas)
    const testLocation = {
      latitude: 32.9341754,
      longitude: -96.8076252
    };
    
    console.log('📍 Ubicación de prueba:', testLocation);
    
    // 1. Actualizar en tabla drivers
    console.log('\n1️⃣ Actualizando en tabla drivers...');
    const { error: driverError } = await supabase
      .from('drivers')
      .update({
        location: testLocation,
        updated_at: new Date().toISOString()
      })
      .eq('id', driverId);
    
    if (driverError) {
      console.error('❌ Error al actualizar drivers:', driverError);
    } else {
      console.log('✅ Ubicación actualizada en drivers');
    }
    
    // 2. Actualizar en tabla ride_requests
    console.log('\n2️⃣ Actualizando en tabla ride_requests...');
    const { error: rideError } = await supabase
      .from('ride_requests')
      .update({
        driver_location: testLocation,
        updated_at: new Date().toISOString()
      })
      .eq('driver_id', driverId)
      .in('status', ['accepted', 'in_progress']);
    
    if (rideError) {
      console.error('❌ Error al actualizar ride_requests:', rideError);
    } else {
      console.log('✅ Ubicación actualizada en ride_requests');
    }
    
    // 3. Verificar la actualización
    console.log('\n3️⃣ Verificando la actualización...');
    const { data: rideData, error: verifyError } = await supabase
      .from('ride_requests')
      .select('id, driver_id, driver_location, status')
      .eq('driver_id', driverId)
      .in('status', ['accepted', 'in_progress'])
      .single();
    
    if (verifyError) {
      console.error('❌ Error al verificar:', verifyError);
    } else {
      console.log('✅ Datos verificados:', rideData);
      console.log('📍 driver_location:', rideData.driver_location);
    }
    
    console.log('\n🎉 Prueba completada');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testDriverLocationUpdate(); 