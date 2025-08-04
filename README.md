# 🚗 Cuzcatlansv.ride - Aplicación de Taxi Web

Aplicación web de taxi con roles de usuario, conductor y administrador, desarrollada con HTML, CSS, JavaScript y Supabase.

## 🎯 **Características Principales**

### 🔐 **Seguridad y Verificación**
- **Fotos de Verificación**: Los conductores pueden subir fotos de:
  - Foto del conductor (rostro)
  - Foto del vehículo completo
  - Foto de la placa del vehículo
- **Verificación de Usuario**: Los usuarios pueden verificar la información del conductor antes de confirmar un viaje

### 👤 **Roles de Usuario**
- **Usuario**: Solicitar taxis, ver historial, configurar perfil
- **Conductor**: Aceptar viajes, gestionar disponibilidad, subir fotos de verificación
- **Administrador**: Panel de administración completo

### 🚗 **Funcionalidades del Conductor**
- Perfil completo con información personal y del vehículo
- Subida de fotos de verificación (conductor, vehículo, placa)
- Gestión de disponibilidad en tiempo real
- Historial de viajes

### 📱 **Funcionalidades del Usuario**
- Solicitar taxi con ubicación
- Verificar información del conductor
- Seguimiento de viajes activos
- Historial de viajes

### 🤖 **Panel de Administración**
- **Monitoreo en tiempo real** de estadísticas
- **Control de recursos** de base de datos
- **Reportes detallados** de uso y rendimiento

## 🛠️ **Tecnologías Utilizadas**

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Mapas**: OpenStreetMap (Nominatim, OSRM)
- **UI**: Material Design, Responsive Design
- **Hosting**: GitHub Pages

## 🚀 **Despliegue**

Esta aplicación está desplegada en GitHub Pages y conectada a Supabase para el backend.

### **URL de Producción:**
- **Frontend**: https://carportsv.github.io/cuzcatlansv.ride/
- **Backend**: Supabase (PostgreSQL + APIs)

## 📁 **Estructura del Proyecto**

```
cuzcatlansv-ride-web/
├── index.html              # Página principal
├── css/                    # Estilos CSS
│   ├── style.css          # Estilos principales
│   ├── components.css     # Componentes
│   └── responsive.css     # Diseño responsivo
├── js/                    # JavaScript
│   ├── app.js            # Lógica principal
│   ├── auth.js           # Autenticación
│   ├── maps.js           # Integración de mapas
│   ├── api.js            # APIs de Supabase
│   └── config.js         # Configuración
├── assets/                # Recursos estáticos
│   └── images/           # Imágenes SVG
└── README.md             # Documentación
```

## 🔧 **Configuración**

### **Variables de Entorno**
Configurar en `js/config.js`:
```javascript
const CONFIG = {
    SUPABASE_URL: 'tu_url_supabase',
    SUPABASE_ANON_KEY: 'tu_clave_anonima',
    // ... otras configuraciones
};
```

## 📞 **Contacto**

Carlos Alfredo Portillo Ayala - [alfay1980@hotmail.com](mailto:alfay1980@hotmail.com)

---

**🚀 Aplicación en producción: https://carportsv.github.io/cuzcatlansv.ride/** 