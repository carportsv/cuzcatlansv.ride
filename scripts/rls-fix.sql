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