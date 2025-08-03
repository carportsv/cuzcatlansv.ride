// Script para verificar usuarios con email vacío y restricciones
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkEmailConstraint() {
  try {
    console.log('🔍 Verificando restricción de email...\n');
    
    // 1. Verificar usuarios con email vacío
    console.log('1. Usuarios con email vacío (string vacío):');
    const { data: emptyEmailUsers, error: emptyEmailError } = await supabase
      .from('users')
      .select('*')
      .eq('email', '');
    
    if (emptyEmailError) {
      console.error('Error obteniendo usuarios con email vacío:', emptyEmailError);
    } else {
      console.log(`Total usuarios con email vacío: ${emptyEmailUsers.length}`);
      emptyEmailUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}`);
        console.log(`     Firebase UID: ${user.firebase_uid}`);
        console.log(`     Email: "${user.email}"`);
        console.log(`     Phone: ${user.phone_number || 'null'}`);
        console.log(`     Role: ${user.role}`);
        console.log('');
      });
    }
    
    // 2. Verificar usuarios con email null
    console.log('2. Usuarios con email null:');
    const { data: nullEmailUsers, error: nullEmailError } = await supabase
      .from('users')
      .select('*')
      .is('email', null);
    
    if (nullEmailError) {
      console.error('Error obteniendo usuarios con email null:', nullEmailError);
    } else {
      console.log(`Total usuarios con email null: ${nullEmailUsers.length}`);
      nullEmailUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ID: ${user.id}`);
        console.log(`     Firebase UID: ${user.firebase_uid}`);
        console.log(`     Email: ${user.email}`);
        console.log(`     Phone: ${user.phone_number || 'null'}`);
        console.log(`     Role: ${user.role}`);
        console.log('');
      });
    }
    
    // 3. Intentar crear un usuario de prueba con email vacío
    console.log('3. Probando crear usuario con email vacío:');
    const testUserData = {
      firebase_uid: 'test-email-empty-' + Date.now(),
      email: '',
      display_name: 'Test User',
      phone_number: '+50399999999',
      role: 'user',
      is_active: true
    };
    
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert(testUserData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Error al crear usuario con email vacío:');
      console.log('   Código:', insertError.code);
      console.log('   Mensaje:', insertError.message);
      console.log('   Detalles:', insertError.details);
    } else {
      console.log('✅ Usuario creado exitosamente con email vacío:');
      console.log('   ID:', newUser.id);
      console.log('   Email:', `"${newUser.email}"`);
      
      // Limpiar usuario de prueba
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', newUser.id);
      
      if (deleteError) {
        console.log('⚠️ Error eliminando usuario de prueba:', deleteError.message);
      } else {
        console.log('✅ Usuario de prueba eliminado');
      }
    }
    
    // 4. Verificar restricciones de la tabla
    console.log('\n4. Verificando restricciones de la tabla users:');
    const { data: constraints, error: constraintsError } = await supabase
      .from('information_schema.table_constraints')
      .select('constraint_name, constraint_type')
      .eq('table_name', 'users')
      .eq('table_schema', 'public');
    
    if (constraintsError) {
      console.error('Error obteniendo restricciones:', constraintsError);
    } else {
      console.log('Restricciones encontradas:');
      constraints.forEach(constraint => {
        console.log(`  - ${constraint.constraint_name}: ${constraint.constraint_type}`);
      });
    }
    
  } catch (error) {
    console.error('Error en verificación:', error);
  }
}

checkEmailConstraint(); 