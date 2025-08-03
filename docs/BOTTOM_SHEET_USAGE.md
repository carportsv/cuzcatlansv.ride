# 📱 Bottom Sheet - Guía de Uso

## 🎯 **Descripción**

El componente `BottomSheet` es un panel deslizable que se puede usar para mostrar contenido adicional sin ocupar todo el espacio de la pantalla. Incluye animaciones suaves y gestos de arrastre intuitivos, funcionando como un botón toggle que se abre y se cierra.

## 🚀 **Características**

- ✅ **Animaciones fluidas** con spring physics
- ✅ **Gestos intuitivos** - arrastrar hacia arriba/abajo
- ✅ **Comportamiento toggle** - se oculta/muestra completamente
- ✅ **Diseño moderno** con sombras y bordes redondeados
- ✅ **Indicador visual** de arrastre (handle)
- ✅ **Reutilizable** en cualquier pantalla

## 📦 **Instalación**

El componente ya está incluido en el proyecto:

```tsx
import BottomSheet from '@/components/BottomSheet';
```

## 🎮 **Uso Básico**

```tsx
import BottomSheet from '@/components/BottomSheet';

function MyScreen() {
  return (
    <View style={{ flex: 1 }}>
      {/* Tu contenido principal */}
      <MapView />
      
      {/* Bottom Sheet */}
      <BottomSheet
        minHeight={120}
        maxHeight={280}
        initialPosition="collapsed"
      >
        <Text>Contenido del Bottom Sheet</Text>
      </BottomSheet>
    </View>
  );
}
```

## ⚙️ **Props Disponibles**

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `children` | `ReactNode` | - | Contenido del bottom sheet |
| `minHeight` | `number` | `height * 0.25` | Altura mínima en píxeles |
| `maxHeight` | `number` | `height * 0.5` | Altura máxima en píxeles |
| `initialPosition` | `'collapsed' \| 'expanded' \| 'hidden'` | `'collapsed'` | Posición inicial |
| `onPositionChange` | `function` | - | Callback cuando cambia la posición |
| `style` | `StyleProp` | - | Estilos adicionales |

## 🎯 **Comportamiento**

### **Comportamiento Toggle (como en Firebase)**
- **Colapsado:** Altura mínima visible
- **Expandido:** Altura máxima configurada
- **Oculto:** Completamente fuera de pantalla
- **Arrastre hacia abajo:** Se oculta completamente
- **Arrastre hacia arriba:** Se muestra colapsado

### **Estados del Bottom Sheet**
1. **`collapsed`** - Altura mínima, contenido básico visible
2. **`expanded`** - Altura máxima, todo el contenido visible
3. **`hidden`** - Completamente oculto fuera de pantalla

## 📱 **Ejemplos de Uso**

### **Ejemplo 1: Panel de Control (Driver Availability)**

```tsx
<BottomSheet
  minHeight={100}
  maxHeight={200}
  initialPosition="collapsed"
>
  <Text style={styles.title}>Estado del Conductor</Text>
  <View style={styles.statusContainer}>
    {/* Controles de disponibilidad */}
  </View>
</BottomSheet>
```

### **Ejemplo 2: Formulario de Solicitud (User Ride)**

```tsx
<BottomSheet
  minHeight={300}
  maxHeight={500}
  initialPosition="collapsed"
>
  <Text style={styles.title}>Solicitar Taxi</Text>
  <PlaceInput placeholder="Origen" />
  <PlaceInput placeholder="Destino" />
  <TouchableOpacity style={styles.button}>
    <Text>Solicitar Taxi</Text>
  </TouchableOpacity>
</BottomSheet>
```

### **Ejemplo 3: Panel con Callback**

```tsx
<BottomSheet
  minHeight={150}
  maxHeight={350}
  initialPosition="collapsed"
  onPositionChange={(position) => console.log('Posición:', position)}
>
  <Text>Panel con callback de posición</Text>
</BottomSheet>
```

## 🎨 **Estilos Personalizados**

```tsx
<BottomSheet
  minHeight={250}
  maxHeight={450}
  style={{
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  }}
>
  {/* Contenido */}
</BottomSheet>
```

## 🔧 **Callbacks**

### **onPositionChange**

```tsx
<BottomSheet
  onPositionChange={(position) => {
    switch (position) {
      case 'collapsed':
        console.log('Bottom sheet colapsado');
        break;
      case 'expanded':
        console.log('Bottom sheet expandido');
        break;
      case 'hidden':
        console.log('Bottom sheet oculto');
        break;
    }
  }}
>
  {/* Contenido */}
</BottomSheet>
```

## 🎯 **Mejores Prácticas**

1. **Altura mínima:** Mantén una altura mínima que permita ver el contenido esencial
2. **Altura máxima:** No excedas el 70% de la altura de la pantalla
3. **Contenido:** Usa ScrollView si el contenido es muy largo
4. **Gestos:** El handle indica que se puede arrastrar
5. **Estados:** El bottom sheet se oculta completamente al arrastrar hacia abajo

## 🐛 **Solución de Problemas**

### **Problema: Bottom sheet no se oculta**
**Solución:** Verifica que no haya otros componentes interceptando los gestos

### **Problema: Animaciones lentas**
**Solución:** Ajusta `tension` y `friction` en el componente

### **Problema: Gestos no responden**
**Solución:** Asegúrate de que el handle esté visible y accesible

## 📚 **Referencias**

- [React Native Animated](https://reactnative.dev/docs/animated)
- [React Native PanResponder](https://reactnative.dev/docs/panresponder)
- [Expo Router](https://docs.expo.dev/router/introduction/)

---

**¡El Bottom Sheet funciona exactamente como en Firebase!** 🎉 