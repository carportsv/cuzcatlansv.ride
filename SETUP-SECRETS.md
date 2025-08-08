# 🔐 Configuración de GitHub Secrets

Este archivo contiene las instrucciones para configurar los secrets de GitHub que reemplazarán los placeholders en el código.

## 📋 Pasos para configurar los secrets:

### 1. Ir a GitHub Repository Settings
- Ve a tu repositorio: https://github.com/carportsv/cuzcatlansv.ride
- Click en **Settings** (pestaña)
- En el menú lateral, click en **Secrets and variables** → **Actions**

### 2. Agregar los siguientes secrets:

#### Firebase Secrets:
- **FIREBASE_API_KEY**: `AIzaSyBW7YFauqJBbv6Xm8a1tsDLGVDzF6rXHhI`
- **FIREBASE_AUTH_DOMAIN**: `taxi-zkt-7f276.firebaseapp.com`
- **FIREBASE_PROJECT_ID**: `taxi-zkt-7f276`
- **FIREBASE_STORAGE_BUCKET**: `taxi-zkt-7f276.appspot.com`
- **FIREBASE_MESSAGING_SENDER_ID**: `570692523770`
- **FIREBASE_APP_ID**: `570692523770-logva41phptcir5h5hj07pmt6vtuovhj.apps.googleusercontent.com`

#### Supabase Secrets:
- **SUPABASE_URL**: `https://wpecvlperiberbmsndlg.supabase.co`
- **SUPABASE_ANON_KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZWN2bHBlcmliZXJibXNuZGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzU0NDksImV4cCI6MjA2NzQxMTQ0OX0.Jx0UjYl1pblxsLXGOLSP5j0gzMyXq4arL_dzxN4YFcs`

### 3. Cómo agregar cada secret:
1. Click en **New repository secret**
2. **Name**: Escribe el nombre del secret (ej: `FIREBASE_API_KEY`)
3. **Value**: Pega el valor correspondiente
4. Click en **Add secret**

### 4. Configurar GitHub Pages:
- Ve a **Settings** → **Pages**
- **Source**: Selecciona **Deploy from a branch**
- **Branch**: Selecciona **gh-pages** (se creará automáticamente)
- **Folder**: Deja **/ (root)**
- Click en **Save**

## 🔄 Cómo funciona:

1. **Código fuente**: Contiene placeholders como `{{FIREBASE_API_KEY}}`
2. **GitHub Actions**: Reemplaza los placeholders con los secrets reales
3. **Despliegue**: Se crea la rama `gh-pages` con las claves reales
4. **GitHub Pages**: Sirve la aplicación desde la rama `gh-pages`

## ✅ Verificación:

Después de configurar todo:
1. Haz un push al repositorio
2. Ve a **Actions** para ver el workflow ejecutándose
3. Cuando termine, la app estará en: `https://carportsv.github.io/cuzcatlansv.ride/`

## 🔒 Seguridad:

- ✅ **Código fuente**: Solo placeholders (sin claves)
- ✅ **GitHub Secrets**: Encriptados, solo visibles para ti
- ✅ **Build process**: Automático, reemplaza placeholders
- ✅ **Resultado final**: Funciona igual que antes

## 🚨 Importante:

- **NUNCA** subas las claves reales al código fuente
- **Siempre** usa los placeholders en el código
- Los secrets se reemplazan **automáticamente** durante el build
