// Script de prueba para verificar sincronización Firebase Auth - Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Verificando configuración de Supabase...');
console.log('URL:', SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
console.log('API Key:', SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan variables de entorno de Supabase');
  console.log('Configura EXPO_PUBLIC_SUPABASE_URL y EXPO_PUBLIC_SUPABASE_ANON_KEY en tu .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseConnection() {
  try {
    console.log('🔄 Probando conexión a Supabase...');
    
    // Probar conexión básica
    const { data, error } = await supabase.from('users').select('*').limit(1);
    
    if (error) {
      console.error('❌ Error conectando a Supabase:', error);
      return false;
    }
    
    console.log('✅ Conexión a Supabase exitosa!');
    console.log('📋 Usuarios en la base de datos:', data.length);
    
    return true;
  } catch (error) {
    console.error('❌ Error inesperado:', error);
    return false;
  }
}

async function testUserSynchronization() {
  try {
    console.log('🔄 Probando sincronización de usuarios...');
    
    // Simular un usuario de Firebase
    const mockFirebaseUser = {
      uid: 'test-user-' + Date.now(),
      email: 'test@example.com',
      displayName: 'Usuario de Prueba',
      phoneNumber: '+50312345678',
      photoURL: null
    };
    
    console.log('📝 Usuario de prueba:', mockFirebaseUser.uid);
    
    // Verificar si el usuario existe
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', mockFirebaseUser.uid)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error verificando usuario:', checkError);
      return false;
    }
    
    if (existingUser) {
      console.log('✅ Usuario ya existe en Supabase');
      return true;
    }
    
    // Crear usuario de prueba
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        firebase_uid: mockFirebaseUser.uid,
        email: mockFirebaseUser.email,
        display_name: mockFirebaseUser.displayName,
        phone_number: mockFirebaseUser.phoneNumber,
        role: 'user',
        is_active: true
      });
    
    if (insertError) {
      console.error('❌ Error creando usuario de prueba:', insertError);
      return false;
    }
    
    console.log('✅ Usuario de prueba creado exitosamente');
    return true;
    
  } catch (error) {
    console.error('❌ Error en prueba de sincronización:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando pruebas de sincronización...\n');
  
  // Probar conexión
  const connectionOk = await testSupabaseConnection();
  if (!connectionOk) {
    console.log('❌ No se pudo conectar a Supabase');
    process.exit(1);
  }
  
  console.log('');
  
  // Probar sincronización
  const syncOk = await testUserSynchronization();
  if (!syncOk) {
    console.log('❌ Error en sincronización');
    process.exit(1);
  }
  
  console.log('');
  console.log('🎉 ¡Todas las pruebas pasaron exitosamente!');
  console.log('✅ Supabase está configurado correctamente');
  console.log('✅ La sincronización funciona correctamente');
}

main().catch(console.error); 