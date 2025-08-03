// Script de diagnóstico para Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function debugSupabase() {
  try {
    console.log('🔍 Diagnóstico de Supabase...\n');
    
    // 1. Verificar todos los usuarios
    console.log('1. Todos los usuarios en la base de datos:');
    const { data: allUsers, error: allUsersError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (allUsersError) {
      console.error('Error obteniendo usuarios:', allUsersError);
    } else {
      console.log(`Total usuarios: ${allUsers.length}`);
      allUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}`);
        console.log(`     Firebase UID: ${user.firebase_uid}`);
        console.log(`     Email: ${user.email || 'null'}`);
        console.log(`     Phone: ${user.phone_number || 'null'}`);
        console.log(`     Role: ${user.role}`);
        console.log(`     Created: ${user.created_at}`);
        console.log('');
      });
    }
    
    // 2. Buscar usuario específico por firebase_uid
    const testUid = 'WcVnXF98ItbA3OvfOqgxFakmPXz1';
    console.log(`2. Buscando usuario con Firebase UID: ${testUid}`);
    const { data: userByUid, error: uidError } = await supabase
      .from('users')
      .select('*')
      .eq('firebase_uid', testUid)
      .single();
    
    if (uidError) {
      console.log(`❌ Usuario no encontrado por UID: ${uidError.message}`);
    } else {
      console.log('✅ Usuario encontrado por UID:');
      console.log(`   ID: ${userByUid.id}`);
      console.log(`   Email: ${userByUid.email || 'null'}`);
      console.log(`   Phone: ${userByUid.phone_number || 'null'}`);
      console.log(`   Role: ${userByUid.role}`);
    }
    
    // 3. Buscar usuarios con email null
    console.log('\n3. Usuarios con email null:');
    const { data: nullEmailUsers, error: nullEmailError } = await supabase
      .from('users')
      .select('*')
      .is('email', null);
    
    if (nullEmailError) {
      console.error('Error obteniendo usuarios con email null:', nullEmailError);
    } else {
      console.log(`Total usuarios con email null: ${nullEmailUsers.length}`);
      nullEmailUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}, UID: ${user.firebase_uid}, Phone: ${user.phone_number}`);
      });
    }
    
    // 4. Verificar restricciones de la tabla
    console.log('\n4. Verificando restricciones de la tabla:');
    const { data: constraints, error: constraintsError } = await supabase
      .rpc('get_table_constraints', { table_name: 'users' })
      .catch(() => ({ data: null, error: 'No se pudo obtener restricciones' }));
    
    if (constraintsError) {
      console.log('No se pudieron obtener las restricciones de la tabla');
    } else {
      console.log('Restricciones de la tabla users:');
      console.log(constraints);
    }
    
  } catch (error) {
    console.error('Error en diagnóstico:', error);
  }
}

debugSupabase(); 