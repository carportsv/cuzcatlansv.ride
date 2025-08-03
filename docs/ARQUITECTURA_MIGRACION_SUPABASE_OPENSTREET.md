# Resumen de Arquitectura y Ruta de Migración

---

## 1. Estado Actual del Proyecto

- **Autenticación:**  
  - Se utiliza **Firebase Auth** (Google) para login, registro y persistencia de sesión.
  - Compatible con móvil (React Native) y web.
  - Soporta login con Google y autenticación por teléfono/email.

- **Base de datos y almacenamiento:**  
  - Actualmente se usan módulos de Firebase (`@react-native-firebase/firestore`, `storage`, etc.) para datos de usuarios, viajes, imágenes, etc.

- **Mapas:**  
  - Se utiliza Google Maps para geolocalización, rutas y visualización de mapas.

- **Estructura multiplataforma:**  
  - El código detecta automáticamente si está en móvil o web y usa el SDK adecuado para cada plataforma.
  - El login y la persistencia de sesión funcionan de forma robusta y segura.

---

## 2. Objetivo de la Nueva Arquitectura

- **Mantener Google/Firebase SOLO para autenticación.**
- **Migrar toda la lógica de datos, almacenamiento y mapas a recursos gratuitos:**
  - **Supabase** para base de datos y almacenamiento.
  - **OpenStreetMap** para mapas y rutas.

---

## 3. Ruta de Migración Recomendada

### A. Autenticación
- **Mantener solo los módulos de Firebase Auth**:
  - `@react-native-firebase/auth` (móvil)
  - `firebase/auth` (web)
- **Eliminar** Firestore, Storage y otros módulos de Firebase del proyecto.

### B. Base de datos y almacenamiento
- **Migrar todos los datos de usuarios, viajes, historial, etc. a Supabase** (Postgres).
- **Migrar el almacenamiento de imágenes y archivos a Supabase Storage**.

### C. Mapas y geolocalización
- **Reemplazar Google Maps por OpenStreetMap** usando librerías como:
  - `react-native-maps` con proveedor OSM.
  - Otras librerías compatibles con OSM para rutas y geocodificación.

### D. Integración entre Firebase Auth y Supabase
- **Al autenticar un usuario con Firebase, sincronizar el UID/email con Supabase**:
  - Si el usuario no existe en Supabase, crearlo automáticamente.
  - Usar el UID/email como clave primaria para los datos en Supabase.
- **Toda la lógica de negocio (viajes, historial, etc.) debe consultar y escribir en Supabase, no en Firebase.**

### E. Realtime y notificaciones
- **Usar canales de Supabase** para notificaciones y actualizaciones en tiempo real (en vez de Firestore listeners).

---

## 4. Ventajas de este modelo

- **Costos mínimos:** Solo pagas por autenticación si superas el límite gratuito de Firebase.
- **Escalabilidad:** Supabase y OpenStreetMap son gratuitos y escalables para la mayoría de proyectos.
- **Flexibilidad:** Puedes cambiar de proveedor de autenticación en el futuro si lo necesitas.

---

## 5. Resumen visual

```mermaid
flowchart TD
    subgraph Autenticación
      A[Firebase Auth (Google)]
    end
    subgraph Datos y Storage
      B[Supabase (Postgres, Storage)]
    end
    subgraph Mapas
      C[OpenStreetMap]
    end
    A -- UID/email --> B
    B -- Coordenadas, rutas --> C
    C -- Visualización --> App
    A -- Sesión --> App
    B -- Datos --> App
```

---

## 6. Siguiente paso

Cuando inicies la nueva copia del proyecto:
- **Dime que este es el modelo a seguir**.
- Yo adaptaré todo el código, hooks y servicios para que:
  - Solo uses Firebase Auth para login.
  - Todo lo demás funcione con Supabase y OpenStreetMap. 