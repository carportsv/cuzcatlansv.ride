// Script de prueba para verificar conexión a Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verificando configuración de Supabase...');
console.log('URL:', SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('API Key:', SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testConnection() {
  try {
    console.log('🔄 Probando conexión a Supabase...');
    
    // Probar conexión básica
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      console.error('❌ Error de conexión:', error.message);
      
      if (error.message.includes('relation "users" does not exist')) {
        console.log('💡 La tabla "users" no existe. Necesitas ejecutar el script de base de datos.');
        console.log('📋 Ve a Supabase Dashboard > SQL Editor y ejecuta el contenido de supabase-schema.sql');
      }
      
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa!');
    console.log('📊 Datos de ejemplo:', data);
    return true;
    
  } catch (err) {
    console.error('❌ Error inesperado:', err);
    return false;
  }
}

testConnection().then(success => {
  if (success) {
    console.log('🎉 ¡Supabase está configurado correctamente!');
  } else {
    console.log('⚠️  Revisa la configuración de Supabase');
  }
}); 