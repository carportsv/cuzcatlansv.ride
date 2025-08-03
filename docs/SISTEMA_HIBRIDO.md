# Sistema Híbrido Realtime/Polling 🚀

## Descripción General

El **Sistema Híbrido** es una solución inteligente que combina **Realtime** y **Polling** para optimizar el uso de las conexiones limitadas de Supabase (2 conexiones gratuitas) mientras mantiene una experiencia de usuario aceptable.

## 🎯 Objetivo

- **Sin costos**: Mantener el plan gratuito de Supabase
- **Experiencia óptima**: Realtime para usuarios activos
- **Escalabilidad**: Polling para usuarios inactivos
- **Eficiencia**: Uso inteligente de recursos

## 🏗️ Arquitectura

### Componentes Principales

1. **RealtimeManager** (`src/services/realtimeService.ts`)
   - Gestor central de conexiones
   - Calcula prioridades automáticamente
   - Maneja rebalanceo de conexiones

2. **useHybridRealtime** (`src/hooks/useHybridRealtime.ts`)
   - Hook personalizado para componentes
   - Manejo automático de conexión/desconexión
   - Actualización de contexto

3. **UsageMonitor** (`app/admin/usage_monitor.tsx`)
   - Panel de monitoreo en tiempo real
   - Estadísticas del sistema
   - Control manual de rebalanceo

## 📊 Estrategias de Prioridad

### 🔴 Alta Prioridad (Realtime)
- **Usuarios en viaje activo**
- **Conductores con viaje en curso**
- **Actualizaciones instantáneas**

### 🟡 Media Prioridad (Polling Frecuente - 15s)
- **Conductores disponibles**
- **Usuarios buscando taxi**
- **Actualizaciones rápidas**

### 🟢 Baja Prioridad (Polling Ocasional - 30s)
- **Usuarios inactivos**
- **Aplicación en segundo plano**
- **Actualizaciones ocasionales**

## 🚀 Implementación

### 1. En Componentes de Usuario

```typescript
import { useHybridRealtime } from '@/hooks/useHybridRealtime';

export default function UserRideScreen() {
  const { user } = useAuth();
  
  const { isRealtimeActive, priority, connect, updateContext } = useHybridRealtime({
    userId: user?.uid || '',
    context: {
      role: 'user',
      hasActiveRide: false,
      isSearching: true
    },
    onRealtimeUpdate: (data) => {
      // Manejar actualizaciones en tiempo real
      console.log('Actualización realtime:', data);
    },
    onPollingUpdate: (data) => {
      // Manejar actualizaciones por polling
      console.log('Actualización polling:', data);
    }
  });

  // Actualizar contexto cuando cambie el estado
  const handleStartSearch = async () => {
    await updateContext({
      role: 'user',
      hasActiveRide: false,
      isSearching: true
    });
  };

  return (
    <View>
      {isRealtimeActive && (
        <Text style={styles.realtimeIndicator}>🟢 En tiempo real</Text>
      )}
      {/* Resto del componente */}
    </View>
  );
}
```

### 2. En Componentes de Driver

```typescript
import { useHybridRealtime } from '@/hooks/useHybridRealtime';

export default function DriverAvailability() {
  const { user } = useAuth();
  const [isAvailable, setIsAvailable] = useState(false);
  
  const { isRealtimeActive, updateContext } = useHybridRealtime({
    userId: user?.uid || '',
    context: {
      role: 'driver',
      hasActiveRide: false,
      isAvailable: isAvailable
    }
  });

  const handleAvailabilityToggle = async (value: boolean) => {
    setIsAvailable(value);
    
    // Actualizar contexto en el sistema híbrido
    await updateContext({
      role: 'driver',
      hasActiveRide: false,
      isAvailable: value
    });
  };

  return (
    <View>
      {isRealtimeActive && (
        <View style={styles.realtimeIndicator}>
          <View style={styles.realtimeDot} />
          <Text>En tiempo real</Text>
        </View>
      )}
      {/* Resto del componente */}
    </View>
  );
}
```

### 3. Hook Simplificado

```typescript
import { useSimpleHybridRealtime } from '@/hooks/useHybridRealtime';

export default function SimpleComponent() {
  const { user } = useAuth();
  const { isRealtimeActive } = useSimpleHybridRealtime(user?.uid || '', 'user');
  
  return (
    <View>
      {isRealtimeActive ? '🟢 Realtime' : '🟡 Polling'}
    </View>
  );
}
```

## 📈 Monitoreo

### Panel de Administración

Accede a `app/admin/usage_monitor.tsx` para ver:

- **Conexiones activas** vs límite
- **Usuarios por estrategia**
- **Eficiencia del sistema**
- **Estado de rebalanceo**

### Métricas Clave

```typescript
const stats = realtimeService.realtimeManager.getStats();
console.log('Estadísticas:', {
  activeConnections: stats.activeConnections, // 0-2
  maxConnections: stats.maxConnections,       // 2
  pollingUsers: stats.pollingUsers,          // N
  totalUsers: stats.totalUsers               // Total
});
```

## 🔧 Configuración

### Límites Personalizables

```typescript
// En RealtimeManager
private maxConnections = 2; // Límite gratuito
private pollingIntervals = {
  frequent: 15000,  // 15 segundos
  occasional: 30000 // 30 segundos
};
```

### Umbrales de Prioridad

```typescript
calculateUserPriority(user: UserSession): UserPriority {
  // Driver activo con viaje = ALTA
  if (user.context.role === 'driver' && user.context.hasActiveRide) {
    return UserPriority.HIGH;
  }
  
  // Usuario en viaje activo = ALTA
  if (user.context.role === 'user' && user.context.hasActiveRide) {
    return UserPriority.HIGH;
  }
  
  // Driver disponible = MEDIA
  if (user.context.role === 'driver' && user.context.isAvailable) {
    return UserPriority.MEDIUM;
  }
  
  // Usuario buscando = MEDIA
  if (user.context.role === 'user' && user.context.isSearching) {
    return UserPriority.MEDIUM;
  }
  
  // Usuario inactivo = BAJA
  return UserPriority.LOW;
}
```

## 🎯 Casos de Uso

### Escenario 1: Usuario Activo (Realtime)
```
Usuario: "Solicito taxi"
[Sin espera] → "Conductor asignado"
[Sin espera] → "Conductor en camino"
[Sin espera] → "Conductor llegó"
```

### Escenario 2: Usuario con Polling
```
Usuario: "Solicito taxi"
[Espera 15-30 segundos] → "Conductor asignado"
[Espera 15-30 segundos] → "Conductor en camino"
[Espera 15-30 segundos] → "Conductor llegó"
```

### Escenario 3: Rebalanceo Automático
```
Usuario A: Termina viaje → Libera conexión realtime
Usuario B: Inicia búsqueda → Obtiene conexión realtime
Usuario C: Sigue con polling → Sin cambios
```

## 🔍 Debugging

### Logs del Sistema

```typescript
// Habilitar logs detallados
console.log('[RealtimeManager] Conectando usuario', userId, 'con prioridad', priority);
console.log('[RealtimeManager] Estadísticas actuales:', stats);
console.log('[RealtimeManager] Rebalanceo ejecutado');
```

### Verificación de Estado

```typescript
// Verificar conexión de usuario específico
const userSession = realtimeService.realtimeManager['userSessions'].get(userId);
console.log('Estado del usuario:', userSession);

// Verificar todas las conexiones
const allConnections = realtimeService.realtimeManager['activeConnections'];
console.log('Conexiones activas:', allConnections);
```

## 🚀 Ventajas

### ✅ Beneficios

1. **Sin costos**: Mantiene plan gratuito
2. **Escalable**: Funciona con cualquier número de usuarios
3. **Inteligente**: Prioriza automáticamente
4. **Transparente**: Usuario no nota la diferencia
5. **Monitoreable**: Estadísticas en tiempo real
6. **Eficiente**: Polling optimizado (15-30s)

### 📊 Comparación

| Aspecto | Solo Realtime | Solo Polling | Híbrido |
|---------|---------------|--------------|---------|
| Costo | $25/mes | $0 | $0 |
| Experiencia | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |
| Escalabilidad | ❌ | ✅ | ✅ |
| Complejidad | ⭐ | ⭐ | ⭐⭐ |
| Eficiencia | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐ |

## 🔮 Futuro

### Mejoras Planificadas

1. **Machine Learning**: Predicción de prioridades
2. **Adaptive Polling**: Intervalos dinámicos
3. **Geolocalización**: Prioridad por proximidad
4. **Analytics**: Métricas avanzadas

### Migración a Plan Pago

Cuando el proyecto crezca:

```typescript
// Cambiar límite de conexiones
private maxConnections = 10; // Plan Pro
// o
private maxConnections = 100; // Plan Enterprise
```

## 📝 Notas Importantes

1. **Limpieza automática**: Los usuarios se desconectan al cerrar la app
2. **Reconexión inteligente**: Se reconecta automáticamente al volver
3. **Fallback robusto**: Si falla realtime, usa polling automáticamente
4. **Sin interrupciones**: El usuario no experimenta cortes
5. **Logs optimizados**: Solo se muestran cada 5 actualizaciones para reducir spam

---

**¡El sistema híbrido está listo para escalar sin límites! 🚀** 