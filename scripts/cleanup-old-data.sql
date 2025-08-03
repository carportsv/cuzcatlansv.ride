-- Script para limpiar datos antiguos y optimizar espacio
-- Ejecutar en Supabase SQL Editor

-- 1. LIMPIAR VIAJES ANTIGUOS (más de 6 meses)
DELETE FROM ride_requests 
WHERE created_at < NOW() - INTERVAL '6 months'
AND status IN ('completed', 'cancelled');

-- 2. LIMPIAR USUARIOS INACTIVOS (más de 1 año sin login)
DELETE FROM users 
WHERE last_login < NOW() - INTERVAL '1 year'
AND role = 'user'; -- No eliminar conductores automáticamente

-- 3. LIMPIAR UBICACIONES ANTIGUAS DE CONDUCTORES (más de 1 día)
UPDATE drivers 
SET location = NULL 
WHERE updated_at < NOW() - INTERVAL '1 day'
AND is_available = false;

-- 4. COMPRIMIR TABLA DE HISTORIAL (más de 3 meses)
DELETE FROM ride_history 
WHERE created_at < NOW() - INTERVAL '3 months';

-- 5. LIMPIAR NOTIFICACIONES ANTIGUAS (más de 1 mes)
DELETE FROM notifications 
WHERE created_at < NOW() - INTERVAL '1 month'
AND read_at IS NOT NULL;

-- 6. VACUUM PARA OPTIMIZAR ESPACIO
VACUUM ANALYZE;

-- 7. VERIFICAR ESPACIO LIBERADO
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC; 