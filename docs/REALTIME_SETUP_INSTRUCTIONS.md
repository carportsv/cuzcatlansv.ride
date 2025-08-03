# 🔧 Instrucciones para Habilitar Realtime en Supabase

## 🚨 **Problema Identificado:**
- **Realtime no funciona** en la aplicación móvil
- **Suscripción se establece** pero no recibe eventos
- **Tabla `drivers` no está** en la publicación de Realtime

---

## 📋 **Pasos para Solucionar:**

### **✅ PASO 1: Ir al Dashboard de Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto `taxi-zkt-7f276`

### **✅ PASO 2: Ir a Database > Replication**
1. En el menú lateral, haz clic en **"Database"**
2. Haz clic en **"Replication"**
3. Verifica que **"Realtime"** esté habilitado (toggle verde)

### **✅ PASO 3: Ejecutar SQL en SQL Editor**
1. Ve a **"SQL Editor"** en el menú lateral
2. Haz clic en **"New query"**
3. Copia y pega el siguiente código:

```sql
-- Habilitar Realtime para tabla drivers
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar si la publicación de Realtime existe
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- 2. Agregar la tabla drivers a la publicación de Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE drivers;

-- 3. Verificar que la tabla fue agregada correctamente
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'drivers';

-- 4. Verificar todas las tablas en la publicación
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

4. Haz clic en **"Run"** para ejecutar el código

### **✅ PASO 4: Verificar Resultados**
Después de ejecutar el SQL, deberías ver:

**Resultado esperado del PASO 1:**
```
pubname           | puballtables | pubinsert | pubupdate | pubdelete | pubtruncate
------------------|--------------|-----------|-----------|-----------|------------
supabase_realtime | false        | true      | true      | true      | false
```

**Resultado esperado del PASO 3:**
```
schemaname | tablename | pubname
-----------|-----------|----------
public     | drivers   | supabase_realtime
```

**Resultado esperado del PASO 4:**
```
schemaname | tablename | pubname
-----------|-----------|----------
public     | drivers   | supabase_realtime
public     | users     | supabase_realtime
... (otras tablas)
```

### **✅ PASO 5: Probar la Configuración**
1. Regresa a tu terminal
2. Ejecuta el script de prueba:
```bash
node test-app-simulation.js
```

3. Deberías ver:
```
🎉 EVENTO RECIBIDO EN TIEMPO REAL:
  Tipo: UPDATE
  ID: e773a7de-f48a-4f54-a6a0-0f651d748685
  Disponible: false
  Estado: inactive
```

---

## 🔍 **Verificación Adicional:**

### **✅ Verificar en Dashboard:**
1. Ve a **Database > Replication**
2. Verifica que la tabla **"drivers"** aparezca en la lista de tablas con Realtime habilitado
3. El toggle debería estar **verde** para la tabla drivers

### **✅ Verificar en SQL Editor:**
Ejecuta esta consulta para verificar:
```sql
SELECT 
    schemaname,
    tablename,
    pubname
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'
ORDER BY tablename;
```

---

## 🚀 **Después de la Configuración:**

### **✅ Probar en la Aplicación:**
1. Abre la aplicación móvil
2. Ve a la pantalla de solicitud de taxi
3. Cambia la disponibilidad de un conductor
4. Verifica que los marcadores aparezcan/desaparezcan automáticamente

### **✅ Logs Esperados:**
En la aplicación deberías ver:
```
🔗 Iniciando suscripción en tiempo real para conductores...
🔗 Estado de suscripción a conductores: SUBSCRIBED
✅ Suscripción a conductores activa y funcionando
🔄 Cambio en disponibilidad de conductor detectado: {...}
✅ Procesando cambio relevante de conductor
🗺️ Marcadores actualizados: 1 conductores
```

---

## 🆘 **Si No Funciona:**

### **✅ Verificar RLS:**
Si Realtime está habilitado pero no funciona, puede ser un problema de RLS:

```sql
-- Deshabilitar RLS temporalmente para pruebas
ALTER TABLE drivers DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
```

### **✅ Verificar Permisos:**
Asegúrate de que el usuario anónimo tenga permisos:

```sql
-- Verificar permisos
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'drivers';
```

---

**Estado:** 🔧 **PENDIENTE DE CONFIGURACIÓN**
**Prioridad:** 🚨 **ALTA**
**Confianza:** 🎯 **95%** (solución identificada) 