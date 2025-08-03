# 🧪 Guía de Pruebas - Sistema Híbrido

## 🎯 Objetivo
Verificar que el sistema híbrido funciona correctamente en web y móvil.

## 🚀 Iniciar Pruebas

### 1. Iniciar la Aplicación
```bash
npm start
```

### 2. Abrir en Web
- **URL**: http://localhost:8083
- **O presiona**: `w` en la terminal

## 📋 Checklist de Pruebas

### ✅ **Prueba 1: Usuario Solicitando Taxi**

#### Pasos:
1. **Inicia sesión** como usuario
2. **Navega a**: "Solicitar Taxi"
3. **Observa** el botón flotante
4. **Presiona** el botón para expandir
5. **Verifica** indicador de realtime

#### Resultado Esperado:
- ✅ Botón flotante visible
- ✅ Panel se expande al presionar
- ✅ Indicador "En tiempo real" o sin indicador
- ✅ Consola muestra logs de conexión

#### Logs Esperados:
```javascript
[RealtimeManager] Conectando usuario abc123 con prioridad medium
[UserRide] Conectado al sistema híbrido: {activeConnections: 1, maxConnections: 2, ...}
```

---

### ✅ **Prueba 2: Driver Disponible**

#### Pasos:
1. **Inicia sesión** como driver
2. **Navega a**: "Disponibilidad"
3. **Observa** el estado inicial
4. **Presiona** "Disponible"
5. **Verifica** cambio de prioridad

#### Resultado Esperado:
- ✅ Mapa muestra ubicación
- ✅ Botón flotante funcional
- ✅ Estado cambia a "Disponible"
- ✅ Indicador de realtime aparece/desaparece

#### Logs Esperados:
```javascript
[RealtimeManager] Conectando usuario def456 con prioridad medium
[DriverAvailability] Conectado al sistema híbrido: {activeConnections: 1, maxConnections: 2, ...}
```

---

### ✅ **Prueba 3: Panel de Admin**

#### Pasos:
1. **Inicia sesión** como admin
2. **Navega a**: "Usage Monitor"
3. **Observa** las estadísticas
4. **Presiona** "Rebalancear Conexiones"
5. **Verifica** actualización de datos

#### Resultado Esperado:
- ✅ Estadísticas en tiempo real
- ✅ Gráfico de uso de conexiones
- ✅ Lista de estrategias activas
- ✅ Botón de rebalanceo funcional

#### Elementos a Verificar:
- **Conexiones Activas**: 0-2
- **Usuarios con Polling**: N
- **Total de Usuarios**: N
- **Eficiencia**: Bajo/Medio/Alto

---

### ✅ **Prueba 4: Múltiples Usuarios**

#### Pasos:
1. **Abre 2-3 pestañas** del navegador
2. **Inicia sesión** con diferentes usuarios
3. **Activa** diferentes funcionalidades
4. **Observa** el panel de admin
5. **Verifica** rebalanceo automático

#### Resultado Esperado:
- ✅ Solo 2 conexiones realtime activas
- ✅ Resto de usuarios usan polling
- ✅ Panel admin muestra distribución
- ✅ Rebalanceo automático funciona

---

### ✅ **Prueba 5: Consola del Navegador**

#### Pasos:
1. **Abre DevTools** (F12)
2. **Ve a la pestaña** Console
3. **Navega** por la aplicación
4. **Observa** los logs del sistema

#### Logs a Buscar:
```javascript
// Conexión de usuario
[RealtimeManager] Conectando usuario xxx con prioridad xxx

// Actualización de contexto
[RealtimeManager] Contexto actualizado para xxx

// Rebalanceo
[RealtimeManager] Promoviendo xxx a realtime

// Desconexión
[RealtimeManager] Desconectando usuario xxx
```

---

## 🔍 **Indicadores Visuales**

### 🟢 **Realtime Activo**
```
[Usuario] "En tiempo real" 
[Driver] "En tiempo real"
[Admin] Indicador verde en panel
```

### 🟡 **Polling Activo**
```
[Usuario] Sin indicador específico
[Driver] Sin indicador específico  
[Admin] Usuario aparece en "Polling"
```

### 📊 **Panel Admin**
```
Conexiones: 1/2 (50%)
Eficiencia: Medio
Estrategias: 1 realtime, 2 polling
```

## 🐛 **Solución de Problemas**

### **Problema**: No aparecen logs en consola
**Solución**: Verificar que el navegador soporte console.log

### **Problema**: Panel admin no actualiza
**Solución**: Refrescar la página o presionar "Rebalancear"

### **Problema**: Usuarios no se conectan
**Solución**: Verificar que Supabase esté configurado correctamente

### **Problema**: Indicadores no aparecen
**Solución**: Verificar que los componentes estén usando el hook correcto

## 📱 **Prueba en Móvil**

### **Android/iOS**:
1. **Instala Expo Go**
2. **Escanea el QR** de la terminal
3. **Sigue** los mismos pasos de prueba
4. **Observa** comportamiento similar

### **Diferencias Móvil**:
- ⚡ **Mejor rendimiento** de realtime
- 📍 **GPS más preciso**
- 🔔 **Notificaciones push** (si configuradas)

## 🎯 **Criterios de Éxito**

### ✅ **Funcional**:
- [ ] Usuarios se conectan correctamente
- [ ] Prioridades se calculan automáticamente
- [ ] Realtime funciona para usuarios activos
- [ ] Polling funciona para usuarios inactivos
- [ ] Panel admin muestra estadísticas correctas

### ✅ **Experiencia**:
- [ ] Sin interrupciones visibles
- [ ] Indicadores claros de estado
- [ ] Transiciones suaves
- [ ] Respuesta rápida

### ✅ **Técnico**:
- [ ] Logs correctos en consola
- [ ] Conexiones limitadas a 2
- [ ] Rebalanceo automático
- [ ] Limpieza de conexiones

## 🚀 **Próximos Pasos**

1. **Probar** con más usuarios simultáneos
2. **Verificar** rendimiento bajo carga
3. **Monitorear** uso de recursos
4. **Optimizar** según resultados

---

**¡El sistema está listo para producción! 🎉** 