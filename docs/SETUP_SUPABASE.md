# Configuración de Supabase

## 🚀 Pasos para configurar Supabase

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com)
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Anota la **URL** y la **API Key** (anon/public)

### 2. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Variables de entorno para Supabase
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase_aqui
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_api_key_de_supabase_aqui

# Firebase Auth (mantener para autenticación)
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyBW7YFauqJBbv6Xm8a1tsDLGVDzF6rXHhI
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=taxi-zkt-7f276.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=taxi-zkt-7f276
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=taxi-zkt-7f276.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=570692523770
EXPO_PUBLIC_FIREBASE_APP_ID=1:570692523770:android:26e5ad5e0c0ded43331b43
```

### 3. Ejecutar el esquema de base de datos

Una vez configuradas las variables, ejecuta:

```bash
npm run setup-supabase
```

### 4. Verificar configuración

El script creará las siguientes tablas:
- `users` - Datos de usuarios
- `ride_requests` - Solicitudes de viaje
- `drivers` - Datos de conductores
- `user_settings` - Configuraciones de usuario

### 5. Probar la aplicación

Después de configurar Supabase, la aplicación debería funcionar sin errores de base de datos.

## 🔧 Solución de problemas

### Error: "Variables de entorno no encontradas"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Asegúrate de que las variables `EXPO_PUBLIC_SUPABASE_URL` y `EXPO_PUBLIC_SUPABASE_ANON_KEY` estén configuradas

### Error: "Tablas no existen"
- Ejecuta `npm run setup-supabase` para crear las tablas
- Verifica que tienes permisos de administrador en Supabase

### Error: "UUID inválido"
- Este error se solucionó cambiando el código para usar `firebase_uid` en lugar de `id`

## 📊 Estructura de la base de datos

### Tabla `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  display_name TEXT,
  phone_number TEXT,
  photo_url TEXT,
  role TEXT DEFAULT 'user',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Tabla `ride_requests`
```sql
CREATE TABLE ride_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  driver_id UUID,
  origin JSONB NOT NULL,
  destination JSONB NOT NULL,
  status TEXT DEFAULT 'requested',
  price DECIMAL(10,2),
  distance DECIMAL(8,2),
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🎯 Resultado esperado

Después de completar la configuración:
- ✅ La app se abre sin errores
- ✅ La autenticación con Google funciona
- ✅ Los datos se guardan en Supabase
- ✅ No hay errores de UUID o tablas faltantes 