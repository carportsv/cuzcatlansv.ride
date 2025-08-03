const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function generateRLSFix() {
  console.log('🔧 Generando script para arreglar políticas RLS...');
  console.log('');
  console.log('📋 Copia y pega el siguiente código en el SQL Editor de Supabase:');
  console.log('');

  const sqlScript = `
-- Script para arreglar políticas RLS para Firebase Auth
-- Ejecutar este script en el SQL Editor de Supabase

-- Eliminar políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Users can insert own profile" ON users;

DROP POLICY IF EXISTS "Drivers can view own data" ON drivers;
DROP POLICY IF EXISTS "Drivers can update own data" ON drivers;
DROP POLICY IF EXISTS "Drivers can insert own data" ON drivers;
DROP POLICY IF EXISTS "Anyone can view available drivers" ON drivers;

DROP POLICY IF EXISTS "Users can view own rides" ON ride_requests;
DROP POLICY IF EXISTS "Users can create own rides" ON ride_requests;
DROP POLICY IF EXISTS "Drivers can view assigned rides" ON ride_requests;
DROP POLICY IF EXISTS "Drivers can update assigned rides" ON ride_requests;

DROP POLICY IF EXISTS "Users can view own messages" ON messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON messages;

DROP POLICY IF EXISTS "Users can view own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON user_settings;

-- Crear políticas temporales que permitan acceso completo (solo para desarrollo)
-- En producción, estas políticas deben ser más restrictivas

-- Políticas para usuarios (permitir acceso completo temporalmente)
CREATE POLICY "Allow all users operations" ON users FOR ALL USING (true) WITH CHECK (true);

-- Políticas para conductores (permitir acceso completo temporalmente)
CREATE POLICY "Allow all drivers operations" ON drivers FOR ALL USING (true) WITH CHECK (true);

-- Políticas para solicitudes de viaje (permitir acceso completo temporalmente)
CREATE POLICY "Allow all ride_requests operations" ON ride_requests FOR ALL USING (true) WITH CHECK (true);

-- Políticas para mensajes (permitir acceso completo temporalmente)
CREATE POLICY "Allow all messages operations" ON messages FOR ALL USING (true) WITH CHECK (true);

-- Políticas para configuraciones de usuario (permitir acceso completo temporalmente)
CREATE POLICY "Allow all user_settings operations" ON user_settings FOR ALL USING (true) WITH CHECK (true);

-- Políticas para historial de viajes (permitir acceso completo temporalmente)
CREATE POLICY "Allow all ride_history operations" ON ride_history FOR ALL USING (true) WITH CHECK (true);

-- NOTA: Estas políticas permiten acceso completo a todos los usuarios
-- En producción, debes implementar políticas más restrictivas basadas en Firebase UID
-- Ejemplo de política restrictiva:
-- CREATE POLICY "Users can view own profile" ON users FOR SELECT 
-- USING (firebase_uid = current_setting('request.jwt.claims', true)::json->>'sub');
`;

  console.log(sqlScript);
  console.log('');
  console.log('⚠️  ADVERTENCIA: Estas políticas permiten acceso completo a todos los usuarios.');
  console.log('⚠️  Solo usar para desarrollo. En producción, implementar políticas más restrictivas.');
  console.log('');
  console.log('✅ Script generado. Copia y pega el código anterior en el SQL Editor de Supabase.');
}

generateRLSFix(); 