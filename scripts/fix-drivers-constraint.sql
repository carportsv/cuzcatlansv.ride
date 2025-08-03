-- Script para agregar restricción única en la tabla drivers
-- Ejecutar este script en el SQL Editor de Supabase

-- Agregar restricción única en user_id para la tabla drivers
ALTER TABLE drivers ADD CONSTRAINT drivers_user_id_unique UNIQUE (user_id);

-- Verificar que la restricción se agregó correctamente
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    tc.constraint_type
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
WHERE tc.table_name = 'drivers' AND tc.constraint_type = 'UNIQUE'; 