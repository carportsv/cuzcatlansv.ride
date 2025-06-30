# Flujo de Autenticación - TaxiZKT

## Descripción General

El sistema de autenticación de TaxiZKT ahora incluye una pantalla de selección de tipo de usuario que permite a los usuarios registrarse según su rol específico (Usuario, Conductor, Administrador) antes de proceder al login.

## Flujo de Navegación

### 1. Pantalla de Selección de Tipo de Usuario (`/user-type-selection`)
- **Propósito**: Primera pantalla que ven los usuarios no autenticados
- **Funcionalidades**:
  - Selección entre 3 tipos de cuenta: Usuario, Conductor, Administrador
  - Botón de registro para cada tipo
  - Botón de login para usuarios existentes
- **Diseño**: Interfaz moderna con gradientes y tarjetas atractivas

### 2. Pantallas de Registro Específicas

#### Registro de Usuario (`/register/user`)
- **Campos requeridos**:
  - Nombre completo
  - Correo electrónico
  - Número de teléfono
- **Rol asignado**: `user`
- **Redirección**: `/user/user_home`

#### Registro de Conductor (`/register/driver`)
- **Campos requeridos**:
  - Nombre completo
  - Correo electrónico
  - Número de teléfono
  - Número de licencia
  - Modelo del vehículo
  - Color del vehículo
  - Placa del vehículo
  - Año del vehículo
- **Rol asignado**: `driver`
- **Estado inicial**: `pending` (pendiente de verificación)
- **Redirección**: `/driver/driver_home`

#### Registro de Administrador (`/register/admin`)
- **Campos requeridos**:
  - Nombre completo
  - Correo electrónico
  - Número de teléfono
  - Código de administrador (validación)
  - Departamento
  - Cargo
- **Rol asignado**: `admin`
- **Códigos válidos**: `ADMIN2024`, `SUPERADMIN`, `TAXIZKT_ADMIN`
- **Permisos**: Completos (`['all']`)
- **Redirección**: `/admin/admin_home`

### 3. Login Unificado (`/login`)
- **Propósito**: Autenticación para usuarios existentes
- **Funcionalidad**: Verificación por SMS
- **Redirección automática**: Según el rol del usuario

## Estructura de Archivos

```
app/
├── user-type-selection.tsx     # Pantalla de selección de tipo
├── login.tsx                   # Login unificado
├── register/
│   ├── user.tsx               # Registro de usuarios
│   ├── driver.tsx             # Registro de conductores
│   └── admin.tsx              # Registro de administradores
└── ModalVerificacion.tsx      # Modal de verificación SMS
```

## Flujo de Datos

### 1. Registro
1. Usuario selecciona tipo de cuenta
2. Completa formulario específico
3. Se envía código SMS
4. Verifica código
5. Se crea perfil en Firestore
6. Se redirige según rol

### 2. Login
1. Usuario ingresa número de teléfono
2. Se envía código SMS
3. Verifica código
4. Se recupera rol desde Firestore
5. Se redirige según rol

## Validaciones

### Usuario
- Nombre obligatorio
- Email válido
- Teléfono válido

### Conductor
- Todos los campos de usuario
- Licencia obligatoria
- Información completa del vehículo
- Estado inicial: pendiente de verificación

### Administrador
- Todos los campos de usuario
- Código de autorización válido
- Departamento y cargo obligatorios
- Permisos completos

## Seguridad

- **Códigos de administrador**: Hardcodeados (en producción deberían estar en base de datos segura)
- **Verificación SMS**: Firebase Phone Auth
- **Roles**: Almacenados en Firestore
- **Sesiones**: Persistidas en AsyncStorage

## Navegación Automática

El archivo `app/index.tsx` maneja la redirección automática:
- **Usuarios autenticados**: Redirige según rol
- **Usuarios no autenticados**: Va a selección de tipo de usuario

## Consideraciones de Producción

1. **Códigos de administrador**: Mover a base de datos segura
2. **Validación de conductores**: Implementar proceso de verificación
3. **Logs de auditoría**: Registrar registros de administradores
4. **Rate limiting**: Limitar intentos de registro/login
5. **Verificación de email**: Agregar verificación por email

## Próximas Mejoras

- [ ] Verificación de documentos para conductores
- [ ] Sistema de aprobación de conductores
- [ ] Verificación de email
- [ ] Recuperación de contraseña
- [ ] Logs de auditoría
- [ ] Dashboard de administración de usuarios 