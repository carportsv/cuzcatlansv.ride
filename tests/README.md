# 🧪 Scripts de Prueba y Debugging - Taxi ZKT

## 🎯 **Descripción General**

Esta carpeta contiene todos los scripts de prueba, debugging y verificación utilizados durante el desarrollo y mantenimiento del proyecto Taxi ZKT.

---

## 📋 **Índice de Scripts de Prueba**

### **🔍 Pruebas de Base de Datos**
- **[test-supabase.js](./test-supabase.js)** - Prueba básica de conexión a Supabase
- **[test-sync.js](./test-sync.js)** - Prueba de sincronización de datos
- **[verify-tables.js](./verify-tables.js)** - Verificar estructura de tablas
- **[create-missing-tables.js](./create-missing-tables.js)** - Crear tablas faltantes

### **🔗 Pruebas de Tiempo Real**
- **[test-realtime-subscription.js](./test-realtime-subscription.js)** - Prueba de suscripciones en tiempo real
- **[test-app-simulation.js](./test-app-simulation.js)** - Simulación completa de la aplicación
- **[enable-realtime.js](./enable-realtime.js)** - Habilitar y probar tiempo real
- **[check-realtime-config.js](./check-realtime-config.js)** - Verificar configuración de tiempo real

### **🚗 Pruebas de Conductores**
- **[fix-driver-availability.js](./fix-driver-availability.js)** - Corregir disponibilidad de conductores
- **[check-driver-status.js](./check-driver-status.js)** - Verificar estado de conductores

### **📧 Pruebas de Email**
- **[check-email-constraint.js](./check-email-constraint.js)** - Verificar restricciones de email

### **🗺️ Pruebas de Mapas**
- **[test-openstreetmap-services.js](./test-openstreetmap-services.js)** - Probar servicios de OpenStreetMap

### **📱 Pruebas de Video**
- **[test-video-performance.js](./test-video-performance.js)** - Probar rendimiento de video
- **[debug-video-issue.js](./debug-video-issue.js)** - Debugging de problemas de video
- **[create-test-video.js](./create-test-video.js)** - Crear video de prueba

### **🔧 Pruebas de Sesión**
- **[test-session-persistence.js](./test-session-persistence.js)** - Probar persistencia de sesión

### **🐛 Debugging**
- **[debug-supabase.js](./debug-supabase.js)** - Debugging de conexión a Supabase

---

## 📖 **Descripción Detallada de Cada Script**

### **🔍 test-supabase.js**
**Propósito:** Prueba básica de conexión a Supabase
**Funcionalidad:**
- Conectar a Supabase
- Verificar autenticación
- Probar consultas básicas
- Validar configuración

**Cuándo usar:**
- Después de configurar Supabase
- Para verificar conectividad
- Cuando hay problemas de conexión

### **🔍 test-sync.js**
**Propósito:** Prueba de sincronización de datos
**Funcionalidad:**
- Sincronizar datos entre Firebase y Supabase
- Verificar integridad de datos
- Probar migración de usuarios

**Cuándo usar:**
- Durante migración de datos
- Para verificar sincronización
- Después de cambios en estructura

### **🔍 verify-tables.js**
**Propósito:** Verificar estructura de tablas
**Funcionalidad:**
- Verificar que todas las tablas existan
- Validar estructura de columnas
- Comprobar restricciones

**Cuándo usar:**
- Después de ejecutar scripts SQL
- Para verificar migración
- Antes de desplegar cambios

### **🔍 create-missing-tables.js**
**Propósito:** Crear tablas faltantes
**Funcionalidad:**
- Detectar tablas faltantes
- Crear tablas automáticamente
- Configurar estructura básica

**Cuándo usar:**
- Cuando faltan tablas
- Para completar migración
- En desarrollo inicial

### **🔗 test-realtime-subscription.js**
**Propósito:** Prueba de suscripciones en tiempo real
**Funcionalidad:**
- Probar suscripciones a cambios
- Verificar recepción de eventos
- Validar configuración de Realtime

**Cuándo usar:**
- Cuando el tiempo real no funciona
- Para verificar suscripciones
- Después de cambios en configuración

### **🔗 test-app-simulation.js**
**Propósito:** Simulación completa de la aplicación
**Funcionalidad:**
- Simular flujo completo de usuario
- Probar interacciones de conductor
- Validar funcionalidades principales

**Cuándo usar:**
- Para pruebas de integración
- Antes de desplegar cambios
- Para validar funcionalidades

### **🔗 enable-realtime.js**
**Propósito:** Habilitar y probar tiempo real
**Funcionalidad:**
- Configurar Realtime
- Probar suscripciones
- Validar funcionamiento

**Cuándo usar:**
- Para habilitar tiempo real
- Cuando hay problemas de configuración
- Después de cambios en base de datos

### **🔗 check-realtime-config.js**
**Propósito:** Verificar configuración de tiempo real
**Funcionalidad:**
- Verificar configuración de Realtime
- Validar publicaciones
- Comprobar permisos

**Cuándo usar:**
- Para diagnosticar problemas de tiempo real
- Después de cambios en configuración
- Para verificar setup

### **🚗 fix-driver-availability.js**
**Propósito:** Corregir disponibilidad de conductores
**Funcionalidad:**
- Actualizar estados de conductores
- Limpiar datos inconsistentes
- Corregir disponibilidad

**Cuándo usar:**
- Cuando los conductores no aparecen
- Para limpiar datos inconsistentes
- Después de problemas de sincronización

### **🚗 check-driver-status.js**
**Propósito:** Verificar estado de conductores
**Funcionalidad:**
- Verificar estados de conductores
- Validar datos de ubicación
- Comprobar disponibilidad

**Cuándo usar:**
- Para diagnosticar problemas de conductores
- Después de cambios en lógica
- Para verificar funcionamiento

### **📧 check-email-constraint.js**
**Propósito:** Verificar restricciones de email
**Funcionalidad:**
- Verificar restricciones de email
- Detectar duplicados
- Validar integridad

**Cuándo usar:**
- Cuando hay problemas de email
- Para verificar restricciones
- Después de cambios en usuarios

### **🗺️ test-openstreetmap-services.js**
**Propósito:** Probar servicios de OpenStreetMap
**Funcionalidad:**
- Probar geocodificación
- Validar rutas
- Verificar servicios de mapas

**Cuándo usar:**
- Para verificar servicios de mapas
- Después de cambios en configuración
- Para validar funcionalidades de ubicación

### **📱 test-video-performance.js**
**Propósito:** Probar rendimiento de video
**Funcionalidad:**
- Probar reproducción de video
- Validar rendimiento
- Verificar configuración

**Cuándo usar:**
- Para optimizar video
- Cuando hay problemas de rendimiento
- Para validar configuración

### **📱 debug-video-issue.js**
**Propósito:** Debugging de problemas de video
**Funcionalidad:**
- Diagnosticar problemas de video
- Verificar archivos
- Validar configuración

**Cuándo usar:**
- Cuando el video no funciona
- Para diagnosticar problemas
- Después de cambios en configuración

### **📱 create-test-video.js**
**Propósito:** Crear video de prueba
**Funcionalidad:**
- Generar video de prueba
- Validar formato
- Probar reproducción

**Cuándo usar:**
- Para crear videos de prueba
- Para validar formatos
- En desarrollo de features de video

### **🔧 test-session-persistence.js**
**Propósito:** Probar persistencia de sesión
**Funcionalidad:**
- Probar persistencia de sesión
- Validar autenticación
- Verificar logout/login

**Cuándo usar:**
- Cuando hay problemas de sesión
- Para verificar autenticación
- Después de cambios en auth

### **🐛 debug-supabase.js**
**Propósito:** Debugging de conexión a Supabase
**Funcionalidad:**
- Diagnosticar problemas de conexión
- Verificar configuración
- Validar credenciales

**Cuándo usar:**
- Cuando hay problemas de conexión
- Para verificar configuración
- Para diagnosticar errores

---

## 🚀 **Cómo Usar los Scripts**

### **📋 Orden de Ejecución Recomendado:**

#### **1. Verificación Básica:**
```bash
# Verificar conexión a Supabase
node tests/test-supabase.js

# Verificar estructura de tablas
node tests/verify-tables.js

# Verificar configuración de tiempo real
node tests/check-realtime-config.js
```

#### **2. Pruebas Específicas:**
```bash
# Si hay problemas de tiempo real
node tests/test-realtime-subscription.js

# Si hay problemas de conductores
node tests/check-driver-status.js

# Si hay problemas de video
node tests/debug-video-issue.js
```

#### **3. Correcciones:**
```bash
# Corregir disponibilidad de conductores
node tests/fix-driver-availability.js

# Crear tablas faltantes
node tests/create-missing-tables.js

# Habilitar tiempo real
node tests/enable-realtime.js
```

### **🔧 Ejecución con Variables de Entorno:**
```bash
# Configurar variables antes de ejecutar
export EXPO_PUBLIC_SUPABASE_URL="tu_url"
export EXPO_PUBLIC_SUPABASE_ANON_KEY="tu_clave"

# Ejecutar script
node tests/test-supabase.js
```

---

## 📊 **Estadísticas de Scripts**

### **📈 Uso por Categoría:**
- **Base de Datos:** 4 scripts
- **Tiempo Real:** 4 scripts
- **Conductores:** 2 scripts
- **Email:** 1 script
- **Mapas:** 1 script
- **Video:** 3 scripts
- **Sesión:** 1 script
- **Debugging:** 1 script

### **📊 Tamaños:**
- **Total de scripts:** 17 archivos
- **Tamaño total:** ~80KB
- **Script más grande:** `test-app-simulation.js` (9.6KB)
- **Script más pequeño:** `test-supabase.js` (1.8KB)

---

## ⚠️ **Precauciones**

### **🔒 Seguridad:**
- **No ejecutar** scripts de corrección en producción sin verificar
- **Hacer backup** antes de ejecutar scripts de corrección
- **Verificar permisos** antes de ejecutar scripts

### **🔄 Desarrollo:**
- **Ejecutar en orden** recomendado
- **Verificar resultados** después de cada script
- **Hacer pruebas** en desarrollo antes de producción

### **📝 Logs:**
- **Revisar logs** después de ejecutar scripts
- **Documentar cambios** realizados
- **Mantener historial** de ejecuciones

---

## 🎯 **Casos de Uso Comunes**

### **🚀 Configuración Nueva:**
```bash
# 1. Verificar conexión
node tests/test-supabase.js

# 2. Verificar tablas
node tests/verify-tables.js

# 3. Habilitar tiempo real
node tests/enable-realtime.js
```

### **🔧 Problemas de Tiempo Real:**
```bash
# 1. Verificar configuración
node tests/check-realtime-config.js

# 2. Probar suscripciones
node tests/test-realtime-subscription.js

# 3. Habilitar si es necesario
node tests/enable-realtime.js
```

### **🐛 Problemas de Conductores:**
```bash
# 1. Verificar estado
node tests/check-driver-status.js

# 2. Corregir si es necesario
node tests/fix-driver-availability.js
```

### **📱 Problemas de Video:**
```bash
# 1. Debugging
node tests/debug-video-issue.js

# 2. Probar rendimiento
node tests/test-video-performance.js
```

---

## 📚 **Documentación Relacionada**

### **📖 Guías:**
- **[Configuración de Supabase](../docs/SETUP_SUPABASE.md)**
- **[Diagnóstico de Tiempo Real](../docs/REALTIME_DIAGNOSIS.md)**
- **[Optimización de Video](../docs/VIDEO_SPLASH_OPTIMIZATION.md)**

### **🗄️ Base de Datos:**
- **[Scripts SQL](../database/)**
- **[Scripts de Automatización](../scripts/)**

---

**🧪 Esta carpeta contiene todos los scripts necesarios para probar, verificar y corregir problemas en el proyecto.** 