// Script para verificar que todas las tablas existen en Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function verifyTables() {
  try {
    console.log('🔍 Verificando todas las tablas...\n');
    
    const tables = [
      'users',
      'drivers', 
      'ride_requests',
      'messages',
      'ride_history',
      'user_settings'
    ];
    
    const results = {};
    
    for (const tableName of tables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === '42P01') {
            results[tableName] = false;
            console.log(`❌ ${tableName}: NO existe`);
          } else {
            results[tableName] = true;
            console.log(`✅ ${tableName}: Existe (${error.message})`);
          }
        } else {
          results[tableName] = true;
          console.log(`✅ ${tableName}: Existe`);
        }
      } catch (err) {
        results[tableName] = false;
        console.log(`❌ ${tableName}: NO existe`);
      }
    }
    
    console.log('\n📊 Resumen final:');
    const existingTables = Object.keys(results).filter(table => results[table]);
    const missingTables = Object.keys(results).filter(table => !results[table]);
    
    console.log(`✅ Tablas existentes (${existingTables.length}):`);
    existingTables.forEach(table => console.log(`   - ${table}`));
    
    if (missingTables.length > 0) {
      console.log(`❌ Tablas faltantes (${missingTables.length}):`);
      missingTables.forEach(table => console.log(`   - ${table}`));
    } else {
      console.log('🎉 ¡Todas las tablas están creadas correctamente!');
    }
    
    // Verificar datos de ejemplo
    console.log('\n📈 Datos de ejemplo:');
    try {
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, firebase_uid, email, phone_number, role')
        .limit(3);
      
      if (!usersError && users) {
        console.log(`👥 Usuarios: ${users.length} registros encontrados`);
        users.forEach(user => {
          console.log(`   - ${user.firebase_uid} (${user.role})`);
        });
      }
    } catch (err) {
      console.log('⚠️ No se pudieron obtener datos de usuarios');
    }
    
  } catch (error) {
    console.error('Error en verificación:', error);
  }
}

verifyTables(); 