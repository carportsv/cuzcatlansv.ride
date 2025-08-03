# 🚗 Taxi ZKT - Aplicación de Taxi

Una aplicación completa de taxi con roles de usuario, conductor y administrador, desarrollada con React Native, Expo, Supabase y OpenStreetMap.

## 🎯 **Características Principales**

### 🔐 **Seguridad y Verificación**
- **Fotos de Verificación**: Los conductores pueden subir fotos de:
  - Foto del conductor (rostro)
  - Foto del vehículo completo
  - Foto de la placa del vehículo
- **Verificación de Usuario**: Los usuarios pueden verificar la información del conductor antes de confirmar un viaje
- **Almacenamiento Seguro**: Las imágenes se almacenan en Supabase Storage con estructura organizada

### 👤 **Roles de Usuario**
- **Usuario**: Solicitar taxis, ver historial, configurar perfil
- **Conductor**: Aceptar viajes, gestionar disponibilidad, subir fotos de verificación
- **Administrador**: Panel de administración completo con automatización

### 🚗 **Funcionalidades del Conductor**
- Perfil completo con información personal y del vehículo
- Subida de fotos de verificación (conductor, vehículo, placa)
- Gestión de disponibilidad en tiempo real
- Historial de viajes
- Configuración de preferencias

### 📱 **Funcionalidades del Usuario**
- Solicitar taxi con ubicación
- Verificar información del conductor
- Seguimiento de viajes activos
- Historial de viajes
- Configuración de perfil y direcciones

### 🤖 **Panel de Administración**
- **Automatización completa** de limpieza y optimización
- **Monitoreo en tiempo real** de estadísticas
- **Control de recursos** de base de datos
- **Reportes detallados** de uso y rendimiento

## 🛠️ **Tecnologías Utilizadas**

- **Frontend**: React Native, Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Mapas**: OpenStreetMap (Nominatim, OSRM)
- **Navegación**: Expo Router
- **UI**: Material Icons, React Native Paper
- **Automatización**: Node.js, node-cron

## 📚 **Documentación**

### **📖 Documentación Completa**
Toda la documentación del proyecto está organizada en la carpeta `docs/`:

**[📚 Ver Documentación Completa](./docs/README.md)**

### **🚀 Guías Rápidas**
- **[Configuración de Supabase](./docs/SETUP_SUPABASE.md)**
- **[Guía de Automatización](./docs/AUTOMATION_GUIDE.md)**
- **[Panel de Administración](./docs/ADMIN_AUTOMATION_INTEGRATION.md)**

## ⚡ **Instalación Rápida**

### **1. Clonar y Configurar**
```bash
git clone [url-del-repositorio]
cd zkt_openstreet
npm install --legacy-peer-deps
```

### **2. Configurar Variables de Entorno**
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Configurar variables de Supabase
EXPO_PUBLIC_SUPABASE_URL=tu_url_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### **3. Configurar Supabase**
Ver **[Configuración de Supabase](./docs/SETUP_SUPABASE.md)**

### **4. Ejecutar la Aplicación**
```bash
npm start
```

## 🤖 **Automatización**

### **Comandos Disponibles**
```bash
# Iniciar automatización
npm run automation:start

# Detener automatización
npm run automation:stop

# Ver estado
npm run automation:status

# Limpieza manual
npm run cleanup:manual

# Monitorear uso
npm run monitor:usage
```

### **Panel de Administración**
- Acceder como administrador
- Ir a "Automatización" en el panel
- Controlar todo desde la interfaz visual

## 📁 **Estructura del Proyecto**

```
zkt_openstreet/
├── app/                    # Pantallas de la aplicación
│   ├── driver/            # Pantallas del conductor
│   ├── user/              # Pantallas del usuario
│   └── admin/             # Pantallas del administrador
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── contexts/          # Contextos de React
│   ├── services/          # Servicios (Supabase, etc.)
│   └── hooks/             # Hooks personalizados
├── scripts/               # Scripts de automatización
├── docs/                  # 📚 Documentación completa
└── assets/                # Recursos estáticos
```

## 🔧 **Configuración de Supabase**

### **Reglas de Storage**
```sql
-- Configurar políticas RLS para storage
CREATE POLICY "Users can view own photos" ON storage.objects
  FOR SELECT USING (auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload own photos" ON storage.objects
  FOR INSERT WITH CHECK (auth.uid()::text = (storage.foldername(name))[1]);
```

### **Reglas de Base de Datos**
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ride_requests ENABLE ROW LEVEL SECURITY;
```

## 🚀 **Funcionalidades Avanzadas**

### **🔄 Tiempo Real**
- **Suscripciones en tiempo real** para cambios de conductores
- **Actualización automática** de marcadores en mapas
- **Notificaciones push** para nuevos viajes

### **🗺️ Mapas Integrados**
- **OpenStreetMap** para navegación
- **Geocodificación** con Nominatim
- **Rutas optimizadas** con OSRM

### **🤖 Automatización Inteligente**
- **Limpieza automática** de datos antiguos
- **Optimización de imágenes** automática
- **Monitoreo de uso** de recursos
- **Backups automáticos** semanales

## 📊 **Estadísticas del Proyecto**

- **📱 Pantallas:** 25+ pantallas
- **🔧 Servicios:** 15+ servicios
- **📚 Documentación:** 37+ archivos
- **🤖 Automatización:** 4 tareas programadas
- **🧪 Pruebas:** Checklist completo

## 🤝 **Contribución**

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 **Contacto**

Carlos Alfredo Portillo Ayala - [alfay1980@hotmail.com](mailto:alfay1980@hotmail.com)

---

## 🎯 **Estado del Proyecto**

### **✅ Completado:**
- ✅ Migración completa a Supabase
- ✅ Integración con OpenStreetMap
- ✅ Panel de administración
- ✅ Automatización completa
- ✅ Documentación organizada
- ✅ Optimización de rendimiento

### **🚀 En Producción:**
- 🚀 Aplicación completamente funcional
- 🚀 Automatización activa
- 🚀 Monitoreo en tiempo real
- 🚀 Panel de admin operativo

---

**📚 Para más información, consulta la [documentación completa](./docs/README.md)** 