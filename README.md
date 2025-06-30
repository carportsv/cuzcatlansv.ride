# Taxi ZKT - Aplicación de Taxi

Una aplicación completa de taxi con roles de usuario, conductor y administrador, desarrollada con React Native y Expo.

## Características Principales

### 🔐 Seguridad y Verificación
- **Fotos de Verificación**: Los conductores pueden subir fotos de:
  - Foto del conductor (rostro)
  - Foto del vehículo completo
  - Foto de la placa del vehículo
- **Verificación de Usuario**: Los usuarios pueden verificar la información del conductor antes de confirmar un viaje
- **Almacenamiento Seguro**: Las imágenes se almacenan en Firebase Storage con estructura organizada

### 👤 Roles de Usuario
- **Usuario**: Solicitar taxis, ver historial, configurar perfil
- **Conductor**: Aceptar viajes, gestionar disponibilidad, subir fotos de verificación
- **Administrador**: Panel de administración (en desarrollo)

### 🚗 Funcionalidades del Conductor
- Perfil completo con información personal y del vehículo
- Subida de fotos de verificación (conductor, vehículo, placa)
- Gestión de disponibilidad
- Historial de viajes
- Configuración de preferencias

### 📱 Funcionalidades del Usuario
- Solicitar taxi con ubicación
- Verificar información del conductor
- Seguimiento de viajes activos
- Historial de viajes
- Configuración de perfil y direcciones

## Tecnologías Utilizadas

- **Frontend**: React Native, Expo
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **Navegación**: Expo Router
- **UI**: Material Icons, React Native Paper
- **Mapas**: React Native Maps
- **Imágenes**: Expo Image Picker

## Instalación

1. Clona el repositorio:
```bash
git clone [url-del-repositorio]
cd taxi_zkt
```

2. Instala las dependencias:
```bash
npm install --legacy-peer-deps
```

3. Configura Firebase:
   - Crea un proyecto en Firebase Console
   - Habilita Authentication, Firestore y Storage
   - Configura las reglas de seguridad
   - Actualiza `src/services/firebaseConfig.ts` con tus credenciales

4. Ejecuta la aplicación:
```bash
npm start
```

## Estructura del Proyecto

```
taxi_zkt/
├── app/                    # Pantallas de la aplicación
│   ├── driver/            # Pantallas del conductor
│   ├── user/              # Pantallas del usuario
│   └── admin/             # Pantallas del administrador
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── contexts/          # Contextos de React
│   ├── services/          # Servicios (Firebase, etc.)
│   └── hooks/             # Hooks personalizados
└── assets/                # Recursos estáticos
```

## Funcionalidades de Seguridad

### Subida de Imágenes
- **Componente ImageUpload**: Reutilizable para diferentes tipos de fotos
- **Firebase Storage**: Almacenamiento seguro y organizado
- **Permisos**: Solicitud automática de permisos de cámara y galería
- **Validación**: Verificación de usuario autenticado antes de subir

### Verificación del Conductor
- **Pantalla de Verificación**: Muestra fotos e información del conductor
- **Información Completa**: Nombre, licencia, modelo de vehículo, color, placa
- **Calificación**: Sistema de calificación y número de viajes
- **Confirmación**: El usuario debe confirmar antes de proceder

## Configuración de Firebase

### Reglas de Storage
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /driver-photos/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /vehicle-photos/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /plate-photos/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Reglas de Firestore
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /rideRequests/{requestId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Carlos Alfredo Portillo Ayala - [alfay1980@hotmail.com](mailto:alfay1980@hotmail.com)

Link del proyecto: [https://github.com/tu-usuario/taxi_zkt](https://github.com/tu-usuario/taxi_zkt)
