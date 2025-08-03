# Estrategia de Migración: Firebase a Supabase/OpenStreetMap

Este archivo documenta los pasos recomendados para migrar el proyecto taxi_zkt_openstreet, y servirá para marcar el avance de cada etapa.

---

## 1. Dejar solo la autenticación de Firebase
- [x] Eliminar todas las referencias y dependencias de Firestore y Storage.
- [x] Mantener únicamente la autenticación (login, registro, sesión) con Firebase Auth.

## 2. Configurar Supabase
- [x] Crear proyecto en Supabase y configurar base de datos y almacenamiento.
- [x] Instalar el SDK de Supabase en el proyecto.
- [x] Crear archivo de configuración para Supabase (por ejemplo, `src/services/supabaseClient.ts`).

## 3. Migrar servicios uno por uno
Por cada servicio que usaba Firestore o Storage:
- [x] Copiar la lógica desde firebase como referencia.
- [x] Reescribir el servicio para que use Supabase (Postgres para datos, Storage para archivos).
- [x] Adaptar hooks y componentes que dependían de ese servicio.
- [x] Probar que la funcionalidad siga funcionando correctamente.

## 4. Migrar mapas a OpenStreetMap
- [x] Reemplazar componentes que usan Google Maps por alternativas compatibles con OpenStreetMap.
- [x] Adaptar lógica de geolocalización y rutas.
- [x] Crear componente OpenStreetMap con WebView y Leaflet.
- [x] Crear componente OpenStreetPlacesAutocomplete para reemplazar Google Places.
- [x] Crear servicio openStreetMapService para geocodificación y rutas.
- [x] Remover configuraciones de Google Maps del proyecto.
- [x] Instalar dependencias necesarias (react-native-webview, etc.).

## 5. Sincronización de usuarios
- [x] Al autenticar con Firebase Auth, crear/sincronizar el usuario en Supabase (usar UID/email como clave primaria).

## 6. Migrar lógica de negocio y notificaciones
- [x] Toda la lógica de viajes, historial, etc., debe consultar y escribir en Supabase.
- [x] Usar canales de Supabase para notificaciones en tiempo real si es necesario.

## 7. Pruebas y validación
- [x] Probar cada módulo migrado antes de pasar al siguiente.
- [x] Usar taxi_zkt_firebase como referencia para comparar comportamientos y datos.
- [x] Verificar que la app se abre correctamente sin errores.
- [x] Probar autenticación con Google (Firebase Auth).
- [x] Probar funcionalidad de mapas con OpenStreetMap.

---

### Notas
- Haz commits frecuentes y documenta cada migración de servicio.
- Si algo falla, revisa cómo estaba implementado en firebase y adapta la lógica.
- No borres taxi_zkt_firebase, úsalo siempre como referencia.
- El proyecto ahora usa:
  - **Google Auth** para autenticación (sin costos)
  - **Supabase** para base de datos y storage (gratuito)
  - **OpenStreetMap** para mapas, geocodificación y rutas (gratuito) 