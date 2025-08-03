# 🚗 Flujo Completo de Viaje - Taxi ZKT OpenStreet

## 🎯 **Descripción General**

Este documento describe el flujo completo de viaje implementado en la versión OpenStreet de Taxi ZKT, incluyendo la funcionalidad del botón "Empezar viaje" y el cálculo de ETA en tiempo real.

---

## 📋 **Flujo del Viaje**

### **1. 🚀 Inicio del Viaje (Conductor)**

#### **Botón "Empezar Viaje"**
- **Ubicación**: `app/driver/driver_ride.tsx` (línea 438)
- **Funcionalidad**: 
  - Actualiza el estado del viaje a `in_progress`
  - Registra la hora de inicio (`startedAt`)
  - Calcula ETA inicial para llegar al usuario
  - Notifica al conductor que el viaje ha comenzado

#### **Código Implementado:**
```typescript
const handleStartRide = async () => {
  // Actualizar estado del viaje
  await supabase.from('ride_requests').update({
    status: 'in_progress',
    startedAt: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }).eq('id', ride.id);

  // Calcular ETA inicial
  if (currentLocation && ride.origin?.coordinates) {
    const eta = await calculateETA(currentLocation, ride.origin.coordinates);
    await supabase.from('ride_requests').update({
      eta: eta,
      etaType: 'driver_to_user',
      etaDescription: 'Tiempo para llegar al usuario'
    }).eq('id', ride.id);
  }
};
```

### **2. 📱 Notificación al Usuario**

#### **Detección Automática**
- **Ubicación**: `app/user/user_active_ride.tsx`
- **Funcionalidad**:
  - Detecta cuando el viaje cambia a `in_progress`
  - Muestra notificación visual por 5 segundos
  - Actualiza la interfaz en tiempo real

#### **Notificación Visual:**
```typescript
{showRideStartedNotification && (
  <View style={styles.notificationContainer}>
    <View style={styles.notificationContent}>
      <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
      <Text style={styles.notificationText}>
        ¡El conductor ha iniciado el viaje!
      </Text>
    </View>
  </View>
)}
```

### **3. ⏱️ Cálculo de ETA en Tiempo Real**

#### **Hook useRideTracking**
- **Ubicación**: `src/hooks/useRideTracking.ts`
- **Funcionalidad**:
  - Calcula ETA automáticamente cada 10 minutos
  - Diferentes tipos de ETA según el estado del viaje
  - Actualización en tiempo real en Supabase

#### **Tipos de ETA:**
1. **`driver_to_user`**: Tiempo para que el conductor llegue al usuario
2. **`driver_to_destination`**: Tiempo para llegar al destino
3. **`user_waiting_driver`**: Tiempo de llegada del conductor

#### **Cálculo Automático:**
```typescript
const updateETA = async () => {
  if (isDriver) {
    if (trackingData.status === 'accepted') {
      // Conductor hacia usuario
      etaType = 'driver_to_user';
    } else if (trackingData.status === 'in_progress') {
      // Conductor hacia destino
      etaType = 'driver_to_destination';
    }
  } else {
    // Usuario esperando conductor
    etaType = 'user_waiting_driver';
  }
  
  const eta = await calculateETA(fromCoords, toCoords);
  // Actualizar en Supabase
};
```

---

## 🗺️ **Integración con OpenStreetMap**

### **Servicio de Rutas**
- **Ubicación**: `src/services/openStreetMapService.ts`
- **Funcionalidad**:
  - Cálculo de rutas usando OSRM
  - Optimización de rutas para vehículos
  - Cálculo de distancia y duración

### **Cálculo de ETA:**
```typescript
const calculateETA = async (from: LocationCoords, to: LocationCoords): Promise<string> => {
  const route = await openStreetMapService.getRoute(from, to, 'driving');
  if (route) {
    const etaMinutes = Math.round(route.totalDuration / 60);
    return `${etaMinutes} min`;
  }
  return 'Calculando...';
};
```

---

## 📊 **Estados del Viaje**

### **Flujo de Estados:**
1. **`searching`**: Buscando conductor
2. **`accepted`**: Conductor aceptó el viaje
3. **`in_progress`**: Viaje iniciado (botón "Empezar viaje")
4. **`completed`**: Viaje completado
5. **`cancelled`**: Viaje cancelado

### **Transiciones Clave:**
- **`accepted` → `in_progress`**: Al presionar "Empezar viaje"
- **`in_progress` → `completed`**: Al finalizar el viaje

---

## 🔄 **Tiempo Real**

### **Suscripciones en Tiempo Real:**
- **Ubicación del conductor**: Actualizada cada 5 minutos
- **Estado del viaje**: Actualización inmediata
- **ETA**: Recalculado cada 10 minutos
- **Notificaciones**: Instantáneas

### **Optimización de Rendimiento:**
```typescript
// Debounce para actualizaciones de ubicación
if (now - lastUpdate > 300000) { // 5 minutos
  // Actualizar ubicación
}

// Debounce para cálculos de ETA
if (now - lastETAUpdate < 600000) { // 10 minutos
  return; // No recalcular
}
```

---

## 📱 **Interfaz de Usuario**

### **Pantalla del Conductor (`driver_ride.tsx`)**
- ✅ Botón "Empezar viaje" visible cuando `status === 'accepted'`
- ✅ Mapa con ruta al usuario
- ✅ Información del pasajero
- ✅ Cálculo de ETA en tiempo real

### **Pantalla del Usuario (`user_active_ride.tsx`)**
- ✅ Notificación cuando el viaje inicia
- ✅ Mapa con ubicación del conductor
- ✅ Información del conductor
- ✅ ETA en tiempo real
- ✅ Estado del viaje actualizado

### **Componente RideInfoCard**
- ✅ Muestra ETA con descripción
- ✅ Información del viaje completa
- ✅ Estados visuales diferenciados
- ✅ Información del conductor/pasajero

---

## 🎯 **Funcionalidades Implementadas**

### ✅ **Completado:**
- ✅ Botón "Empezar viaje" funcional
- ✅ Notificación automática al usuario
- ✅ Cálculo de ETA en tiempo real
- ✅ Actualización de estados en tiempo real
- ✅ Integración con OpenStreetMap
- ✅ Optimización de rendimiento
- ✅ Interfaz de usuario completa

### 🔄 **Flujo Completo:**
1. **Usuario solicita viaje** → Estado `searching`
2. **Conductor acepta** → Estado `accepted`
3. **Conductor presiona "Empezar viaje"** → Estado `in_progress`
4. **Usuario recibe notificación** → ETA calculado
5. **Viaje en progreso** → ETA actualizado cada 10 min
6. **Conductor completa viaje** → Estado `completed`

---

## 🚀 **Comandos de Prueba**

### **Ejecutar en Dispositivos:**
```bash
# Dispositivo tablet
npm run device:tablet

# Dispositivo teléfono
npm run device:phone

# Ver dispositivos conectados
npm run device:list
```

### **Verificar Funcionalidad:**
1. Crear un viaje como usuario
2. Aceptar como conductor
3. Presionar "Empezar viaje"
4. Verificar notificación en dispositivo del usuario
5. Verificar ETA en tiempo real

---

## 📚 **Archivos Relacionados**

### **Componentes Principales:**
- `app/driver/driver_ride.tsx` - Pantalla del conductor
- `app/user/user_active_ride.tsx` - Pantalla del usuario
- `src/components/RideInfoCard.tsx` - Tarjeta de información
- `src/hooks/useRideTracking.ts` - Hook de tracking

### **Servicios:**
- `src/services/openStreetMapService.ts` - Servicio de mapas
- `src/services/realtimeService.ts` - Servicio de tiempo real
- `src/services/supabaseClient.ts` - Cliente de base de datos

---

**🎉 El flujo completo de viaje está implementado y funcional en la versión OpenStreet de Taxi ZKT.** 