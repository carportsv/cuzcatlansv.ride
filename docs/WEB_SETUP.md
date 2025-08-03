# Configuración Web - Taxi ZKT OpenStreet

## 🚀 Ejecutar en Web

### Comandos disponibles:

```bash
# Iniciar aplicación web
npm run web

# Iniciar con script mejorado
npm run web:start

# Iniciar en modo desarrollo
npm run web -- --dev
```

### Requisitos:

- Node.js 18+ 
- npm o yarn
- Navegador moderno (Chrome, Firefox, Safari, Edge)

## 🔧 Configuración

### Componentes Web-Compatibles:

1. **OpenStreetMap**: 
   - Móvil: Usa `react-native-webview` con Leaflet
   - Web: Usa Leaflet directamente en el DOM

2. **BottomSheet**:
   - Móvil: Usa `@gorhom/bottom-sheet`
   - Web: Usa Modal nativo de React Native

### Archivos de Configuración:

- `app.config.web.js`: Configuración específica para web
- `src/components/OpenStreetMapWrapper.tsx`: Wrapper que detecta plataforma
- `src/components/BottomSheetWrapper.tsx`: Wrapper para BottomSheet

## 🐛 Solución de Problemas

### Error: "Module not found"
```bash
# Limpiar cache
npm run web -- --clear

# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Error: "Port already in use"
```bash
# Usar puerto diferente
npm run web -- --port 8082
```

### Error: "WebView not available"
- El componente automáticamente usa el fallback web
- Verifica que Leaflet se cargue correctamente

## 📱 Funcionalidades Web

### ✅ Compatible:
- ✅ Autenticación
- ✅ Navegación entre pantallas
- ✅ Formularios
- ✅ Mapas (Leaflet)
- ✅ Modales
- ✅ Geolocalización (navegador)
- ✅ Supabase (base de datos)

### ⚠️ Limitaciones:
- ⚠️ Notificaciones push (solo web push)
- ⚠️ Cámara (usar input file)
- ⚠️ Algunas APIs nativas

## 🌐 Despliegue

### Build para producción:
```bash
# Crear build estático
expo export --platform web

# Los archivos estarán en dist/
```

### Servidor estático:
```bash
# Usar cualquier servidor estático
npx serve dist/
```

## 🔄 Desarrollo

### Hot Reload:
- Los cambios se reflejan automáticamente
- Presiona `r` para recargar manualmente

### Debug:
- Abre DevTools del navegador
- Usa `console.log` para debugging
- React DevTools disponible

## 📋 Checklist Web

- [ ] Aplicación inicia sin errores
- [ ] Mapas se cargan correctamente
- [ ] Navegación funciona
- [ ] Formularios funcionan
- [ ] Autenticación funciona
- [ ] Geolocalización funciona
- [ ] Responsive design
- [ ] Performance aceptable 