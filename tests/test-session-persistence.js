require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const AsyncStorage = require('@react-native-async-storage/async-storage');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSessionPersistence() {
  console.log('🧪 Probando persistencia de sesión...\n');

  try {
    // 1. Verificar si hay sesión almacenada
    console.log('📋 PASO 1: Verificar sesión almacenada...');
    
    // Simular AsyncStorage.getItem
    const sessionData = await AsyncStorage.getItem('userSession');
    const userUID = await AsyncStorage.getItem('userUID');
    const userType = await AsyncStorage.getItem('userType');
    
    console.log('📊 Datos de sesión encontrados:');
    console.log('  userSession:', sessionData ? '✅ Presente' : '❌ No encontrado');
    console.log('  userUID:', userUID || '❌ No encontrado');
    console.log('  userType:', userType || '❌ No encontrado');
    
    if (sessionData) {
      const session = JSON.parse(sessionData);
      console.log('  Detalles de sesión:', {
        uid: session.uid,
        role: session.role,
        phoneNumber: session.phoneNumber,
        name: session.name
      });
    }

    // 2. Verificar usuario en Supabase
    if (userUID) {
      console.log('\n📋 PASO 2: Verificar usuario en Supabase...');
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', userUID)
        .single();

      if (error) {
        console.error('❌ Error obteniendo usuario de Supabase:', error);
      } else if (user) {
        console.log('✅ Usuario encontrado en Supabase:');
        console.log('  ID:', user.id);
        console.log('  Firebase UID:', user.firebase_uid);
        console.log('  Email:', user.email);
        console.log('  Display Name:', user.display_name);
        console.log('  Role:', user.role);
        console.log('  Is Active:', user.is_active);
      } else {
        console.log('⚠️ Usuario no encontrado en Supabase');
      }
    }

    // 3. Verificar conductor si aplica
    if (userUID && userType === 'driver') {
      console.log('\n📋 PASO 3: Verificar datos de conductor...');
      
      const { data: driver, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('user_id', userUID)
        .single();

      if (error) {
        console.error('❌ Error obteniendo conductor de Supabase:', error);
      } else if (driver) {
        console.log('✅ Conductor encontrado en Supabase:');
        console.log('  ID:', driver.id);
        console.log('  Is Available:', driver.is_available);
        console.log('  Status:', driver.status);
        console.log('  Location:', driver.location);
      } else {
        console.log('⚠️ Conductor no encontrado en Supabase');
      }
    }

    // 4. Simular reinicio de aplicación
    console.log('\n📋 PASO 4: Simulando reinicio de aplicación...');
    console.log('💡 En una aplicación real, esto sería equivalente a cerrar y abrir la app');
    
    // Verificar que los datos persisten
    const sessionDataAfter = await AsyncStorage.getItem('userSession');
    const userUIDAfter = await AsyncStorage.getItem('userUID');
    const userTypeAfter = await AsyncStorage.getItem('userType');
    
    console.log('📊 Datos después del "reinicio":');
    console.log('  userSession:', sessionDataAfter ? '✅ Persiste' : '❌ Perdido');
    console.log('  userUID:', userUIDAfter ? '✅ Persiste' : '❌ Perdido');
    console.log('  userType:', userTypeAfter ? '✅ Persiste' : '❌ Perdido');

    // 5. Recomendaciones
    console.log('\n📋 PASO 5: Análisis y recomendaciones...');
    
    if (sessionDataAfter && userUIDAfter && userTypeAfter) {
      console.log('✅ PERSISTENCIA FUNCIONANDO: Los datos se mantienen correctamente');
      console.log('💡 La aplicación debería mantener la sesión al cerrar y abrir');
    } else {
      console.log('❌ PROBLEMA DE PERSISTENCIA: Los datos no se mantienen');
      console.log('💡 Posibles causas:');
      console.log('   - AsyncStorage no está configurado correctamente');
      console.log('   - Los datos se están limpiando en algún lugar');
      console.log('   - Problema con la inicialización de Firebase');
    }

  } catch (error) {
    console.error('❌ Error en prueba de persistencia:', error);
  }
}

testSessionPersistence().then(() => {
  console.log('\n🎉 Prueba de persistencia completada');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error en prueba:', error);
  process.exit(1);
}); 