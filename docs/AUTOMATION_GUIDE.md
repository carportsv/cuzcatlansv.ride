# 🤖 Guía de Automatización Completa

## 🎯 **¿Qué hace la Automatización?**

La automatización maneja **TODO** automáticamente sin intervención manual:

### **✅ 1. Limpieza Automática Semanal**
- **Cuándo:** Domingos a las 2:00 AM
- **Qué hace:**
  - Elimina viajes completados de hace 6+ meses
  - Elimina usuarios inactivos de hace 1+ año
  - Limpia notificaciones leídas de hace 1+ mes
  - Limpia ubicaciones de conductores offline

### **✅ 2. Monitoreo Diario**
- **Cuándo:** Cada día a las 8:00 AM
- **Qué hace:**
  - Cuenta registros en cada tabla
  - Estima uso de espacio
  - Genera reportes de actividad
  - Detecta problemas temprano

### **✅ 3. Optimización de Imágenes (Tiempo Real)**
- **Cuándo:** Cada vez que se sube una imagen
- **Qué hace:**
  - Comprime automáticamente (80-90% calidad)
  - Redimensiona (máximo 800x800px)
  - Convierte a formato eficiente
  - Reduce tamaño en 60-80%

### **✅ 4. Backup Automático**
- **Cuándo:** Domingos a las 3:00 AM
- **Qué hace:**
  - Crea backup de la base de datos
  - Guarda configuración
  - Verifica integridad

### **✅ 5. Alertas Automáticas**
- **Cuándo:** Cada hora
- **Qué hace:**
  - Verifica uso de espacio
  - Alerta si >80% (crítico)
  - Notifica si >60% (moderado)
  - Envía reportes por email/Slack

---

## 🚀 **Cómo Activar la Automatización**

### **✅ Opción 1: Inicio Manual (Desarrollo)**
```bash
# Iniciar automatización
npm run automation:start

# Verificar estado
npm run automation:status

# Detener automatización
npm run automation:stop
```

### **✅ Opción 2: Servidor Dedicado (Producción)**
```bash
# En un servidor Linux/Windows
# Crear servicio systemd o Windows Service

# Ejemplo para Linux:
sudo systemctl enable taxi-automation
sudo systemctl start taxi-automation
sudo systemctl status taxi-automation
```

### **✅ Opción 3: Cloud Functions (Recomendado)**
```bash
# Usar Supabase Edge Functions
# O Firebase Cloud Functions
# O AWS Lambda
# O Vercel Cron Jobs
```

---

## 📋 **Comandos Disponibles**

### **✅ Automatización:**
```bash
npm run automation:start    # Iniciar automatización completa
npm run automation:stop     # Detener automatización
npm run automation:status   # Ver estado actual
```

### **✅ Limpieza Manual:**
```bash
npm run cleanup:manual      # Ejecutar limpieza ahora
npm run monitor:usage       # Ver uso actual
npm run cleanup:sql         # Mostrar SQL para limpieza manual
```

---

## ⏰ **Horarios Programados**

| Tarea | Frecuencia | Hora | Día |
|-------|------------|------|-----|
| **Limpieza** | Semanal | 2:00 AM | Domingo |
| **Monitoreo** | Diario | 8:00 AM | Todos los días |
| **Backup** | Semanal | 3:00 AM | Domingo |
| **Alertas** | Cada hora | XX:00 | Todos los días |

---

## 📊 **Monitoreo y Reportes**

### **✅ Lo que se Monitorea:**
- **Espacio usado:** Base de datos y storage
- **Registros:** Usuarios, viajes, conductores
- **Actividad:** Usuarios activos, viajes recientes
- **Rendimiento:** Tiempo de respuesta, errores

### **✅ Alertas Automáticas:**
- **🟢 Normal:** <60% espacio usado
- **🟡 Moderado:** 60-80% espacio usado
- **🔴 Crítico:** >80% espacio usado

### **✅ Reportes Generados:**
- **Diario:** Estadísticas de uso
- **Semanal:** Resumen de limpieza
- **Mensual:** Análisis de tendencias

---

## 🔧 **Configuración Personalizada**

### **✅ Modificar Horarios:**
```javascript
// En scripts/setup-automation.js
scheduleWeeklyCleanup() {
  // Cambiar '0 2 * * 0' por tu horario preferido
  const task = cron.schedule('0 2 * * 0', async () => {
    // Tu lógica aquí
  });
}
```

### **✅ Modificar Frecuencias:**
```javascript
// Limpieza cada 2 semanas
'0 2 * * 0/2'

// Monitoreo cada 12 horas
'0 */12 * * *'

// Alertas cada 30 minutos
'*/30 * * * *'
```

### **✅ Configurar Notificaciones:**
```javascript
// En setup-automation.js
async sendNotification(title, message) {
  // Integrar con tu sistema preferido:
  // - Email (Gmail, SendGrid)
  // - Slack
  // - Discord
  // - WhatsApp Business API
  // - SMS
}
```

---

## 🛠️ **Solución de Problemas**

### **✅ Error: "Cron job no se ejecuta"**
```bash
# Verificar zona horaria
npm run automation:status

# Verificar logs
tail -f automation.log

# Reiniciar automatización
npm run automation:stop
npm run automation:start
```

### **✅ Error: "No se puede conectar a Supabase"**
```bash
# Verificar variables de entorno
echo $EXPO_PUBLIC_SUPABASE_URL
echo $EXPO_PUBLIC_SUPABASE_ANON_KEY

# Probar conexión
npm run monitor:usage
```

### **✅ Error: "Permisos insuficientes"**
```sql
-- En Supabase SQL Editor
-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'users';
```

---

## 📈 **Beneficios de la Automatización**

### **✅ Para el Desarrollador:**
- **Cero mantenimiento manual**
- **Alertas proactivas**
- **Reportes automáticos**
- **Optimización continua**

### **✅ Para la Aplicación:**
- **Base de datos siempre optimizada**
- **Espacio liberado automáticamente**
- **Imágenes comprimidas**
- **Backups regulares**

### **✅ Para los Usuarios:**
- **Mejor rendimiento**
- **Menos errores**
- **Datos más actualizados**
- **Experiencia más fluida**

---

## 🎯 **Próximos Pasos**

### **✅ 1. Activar Automatización:**
```bash
npm run automation:start
```

### **✅ 2. Verificar Estado:**
```bash
npm run automation:status
```

### **✅ 3. Configurar Notificaciones:**
- Editar `scripts/setup-automation.js`
- Agregar tu sistema de notificaciones preferido

### **✅ 4. Monitorear Resultados:**
```bash
npm run monitor:usage
```

---

**¡La automatización está lista para funcionar! 🚀**

Una vez activada, **TODO** se manejará automáticamente sin intervención manual. 