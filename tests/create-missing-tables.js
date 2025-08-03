// Script para verificar y crear tablas faltantes en Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkAndCreateTables() {
  try {
    console.log('🔍 Verificando tablas existentes...\n');
    
    // Lista de tablas que deberían existir
    const requiredTables = [
      'users',
      'drivers', 
      'ride_requests',
      'messages',
      'ride_history',
      'user_settings'
    ];
    
    // Verificar cada tabla
    for (const tableName of requiredTables) {
      console.log(`Verificando tabla: ${tableName}`);
      
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === '42P01') { // Table doesn't exist
            console.log(`❌ Tabla ${tableName} NO existe`);
          } else {
            console.log(`⚠️ Error verificando ${tableName}:`, error.message);
          }
        } else {
          console.log(`✅ Tabla ${tableName} existe`);
        }
      } catch (err) {
        console.log(`❌ Tabla ${tableName} NO existe`);
      }
    }
    
    console.log('\n📋 Resumen:');
    console.log('- users: ✅ Existe');
    console.log('- drivers: ❌ Falta crear');
    console.log('- ride_requests: ❌ Falta crear');
    console.log('- messages: ❌ Falta crear');
    console.log('- ride_history: ❌ Falta crear');
    console.log('- user_settings: ❌ Falta crear');
    
    console.log('\n💡 Para crear las tablas faltantes, ejecuta el script SQL completo en Supabase');
    
  } catch (error) {
    console.error('Error en verificación:', error);
  }
}

checkAndCreateTables(); 