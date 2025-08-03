# Checklist de Pruebas Manuales - TaxiZKT

## 🧪 **Pruebas Manuales Críticas**

### **📱 Dispositivo de Prueba:**
- [ ] **Android:** Samsung Galaxy S21 / OnePlus 9
- [ ] **iOS:** iPhone 12 / iPhone 13
- [ ] **Emulador:** Android Studio / Xcode Simulator

---

## **🔐 1. Pruebas de Autenticación**

### **1.1 Login con Google**
- [ ] **Botón de Google Sign-In** aparece correctamente
- [ ] **Selección de cuenta** funciona
- [ ] **Autenticación exitosa** redirige a home
- [ ] **Sincronización con Supabase** funciona
- [ ] **Persistencia de sesión** después de cerrar app

### **1.2 Login con Teléfono**
- [ ] **Ingreso de número** de teléfono
- [ ] **Envío de código** SMS
- [ ] **Verificación de código** funciona
- [ ] **Creación de usuario** en Supabase
- [ ] **Redirección** a pantalla de selección de rol

### **1.3 Registro de Usuarios**
- [ ] **Registro de usuario** con teléfono
- [ ] **Registro de conductor** con teléfono
- [ ] **Registro de admin** con teléfono
- [ ] **Validación de datos** funciona
- [ ] **Sincronización** con Supabase

---

## **🗺️ 2. Pruebas de Mapas**

### **2.1 Componente OpenStreetMap**
- [ ] **Renderizado** del mapa
- [ ] **Zoom in/out** funciona
- [ ] **Pan/movimiento** del mapa
- [ ] **Marcadores** se muestran correctamente
- [ ] **Click en marcadores** responde
- [ ] **Click en mapa** obtiene coordenadas

### **2.2 Búsqueda de Lugares**
- [ ] **PlaceInput** se abre correctamente
- [ ] **Autocompletado** mientras escribes
- [ ] **Sugerencias** aparecen
- [ ] **Selección** de lugar funciona
- [ ] **Coordenadas** se obtienen correctamente
- [ ] **Manejo de errores** sin resultados

### **2.3 Geocodificación**
- [ ] **Dirección → Coordenadas** funciona
- [ ] **Coordenadas → Dirección** funciona
- [ ] **Precisión** de ubicaciones
- [ ] **Tiempo de respuesta** aceptable

---

## **🚗 3. Pruebas de Flujo de Usuario**

### **3.1 Solicitud de Taxi**
- [ ] **Pantalla de solicitud** se abre
- [ ] **Selección de origen** con mapa
- [ ] **Selección de destino** con mapa
- [ ] **Cálculo de ruta** se muestra
- [ ] **Estimación de precio** se calcula
- [ ] **Confirmación** crea solicitud
- [ ] **Solicitud** aparece en Supabase

### **3.2 Vista de Conductor**
- [ ] **Lista de solicitudes** se muestra
- [ ] **Mapa de solicitudes** con marcadores
- [ ] **Aceptar solicitud** funciona
- [ ] **Estado** se actualiza en tiempo real
- [ ] **Navegación** se abre correctamente

### **3.3 Viaje Activo**
- [ ] **Ubicación del conductor** se actualiza
- [ ] **Ruta al pasajero** se muestra
- [ ] **ETA** se calcula y actualiza
- [ ] **Estados del viaje** funcionan
- [ ] **Comunicación** entre conductor y pasajero

---

## **📊 4. Pruebas de Base de Datos**

### **4.1 Sincronización Firebase-Supabase**
- [ ] **Usuario creado** en Supabase al autenticarse
- [ ] **Datos de usuario** se sincronizan
- [ ] **Actualizaciones** se reflejan
- [ ] **Sin duplicados** de usuarios

### **4.2 Operaciones CRUD**
- [ ] **Crear** solicitud de viaje
- [ ] **Leer** historial de viajes
- [ ] **Actualizar** estado de viaje
- [ ] **Eliminar** datos (si aplica)

### **4.3 Tiempo Real**
- [ ] **Suscripciones** funcionan
- [ ] **Actualizaciones** en tiempo real
- [ ] **Desconexión** se maneja
- [ ] **Reconexión** automática

---

## **⚡ 5. Pruebas de Rendimiento**

### **5.1 Tiempos de Carga**
- [ ] **Splash screen** < 3 segundos
- [ ] **Login** < 2 segundos
- [ ] **Mapa inicial** < 3 segundos
- [ ] **Búsqueda de lugares** < 2 segundos
- [ ] **Cálculo de ruta** < 5 segundos

### **5.2 Fluidez**
- [ ] **Navegación** entre pantallas fluida
- [ ] **Zoom del mapa** suave
- [ ] **Scroll** en listas
- [ ] **Animaciones** fluidas
- [ ] **Sin lag** en interacciones

### **5.3 Memoria**
- [ ] **Sin memory leaks** después de uso prolongado
- [ ] **Cierre de app** libera memoria
- [ ] **Múltiples mapas** no causan problemas

---

## **🌐 6. Pruebas de Conectividad**

### **6.1 Sin Internet**
- [ ] **Mensaje de error** apropiado
- [ ] **Funcionalidad offline** (si aplica)
- [ ] **Reconexión** automática
- [ ] **Sincronización** cuando vuelve internet

### **6.2 Conexión Lenta**
- [ ] **Timeouts** apropiados
- [ ] **Indicadores de carga** visibles
- [ ] **Retry logic** funciona
- [ ] **Fallbacks** disponibles

### **6.3 Intermitente**
- [ ] **Manejo de errores** de red
- [ ] **Queue de operaciones** pendientes
- [ ] **Sincronización** diferida

---

## **📱 7. Pruebas de Compatibilidad**

### **7.1 Diferentes Tamaños**
- [ ] **Pantalla pequeña** (320dp)
- [ ] **Pantalla mediana** (480dp)
- [ ] **Pantalla grande** (720dp+)
- [ ] **Tablet** (10" +)

### **7.2 Orientación**
- [ ] **Portrait** funciona
- [ ] **Landscape** funciona
- [ ] **Rotación** durante uso
- [ ] **Transiciones** suaves

### **7.3 Versiones de OS**
- [ ] **Android 10+** funciona
- [ ] **iOS 14+** funciona
- [ ] **Web** funciona (si aplica)

---

## **🚨 8. Pruebas de Error**

### **8.1 Datos Inválidos**
- [ ] **Coordenadas fuera de rango**
- [ ] **Direcciones vacías**
- [ ] **Caracteres especiales**
- [ ] **Datos corruptos**

### **8.2 Estados de Error**
- [ ] **Sin permisos de ubicación**
- [ ] **GPS deshabilitado**
- [ ] **Sesión expirada**
- [ ] **Servicios no disponibles**

### **8.3 Recuperación**
- [ ] **Reintentos automáticos**
- [ ] **Mensajes de error claros**
- [ ] **Opciones de recuperación**
- [ ] **Logs de debugging**

---

## **📝 9. Documentación de Errores**

### **9.1 Captura de Errores**
- [ ] **Screenshots** de errores
- [ ] **Logs** de consola
- [ ] **Pasos para reproducir**
- [ ] **Información del dispositivo**

### **9.2 Reporte de Bugs**
- [ ] **Descripción clara** del problema
- [ ] **Severidad** del error
- [ ] **Impacto** en el usuario
- [ ] **Sugerencias** de solución

---

## **✅ 10. Checklist de Finalización**

### **10.1 Verificación Final**
- [ ] **Todas las pruebas** ejecutadas
- [ ] **Errores documentados**
- [ ] **Bugs reportados**
- [ ] **Métricas registradas**

### **10.2 Preparación para Producción**
- [ ] **Configuración** de producción
- [ ] **Variables de entorno** correctas
- [ ] **APIs** configuradas
- [ ] **Monitoreo** implementado

---

**Fecha de pruebas:** _______________
**Tester:** _______________
**Dispositivo:** _______________
**Versión de app:** _______________

**Estado general:** ⭕ Pendiente / ✅ Completado / ❌ Falló 