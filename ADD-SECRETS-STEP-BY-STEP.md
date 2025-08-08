# 🔐 GUÍA PASO A PASO: Agregar GitHub Secrets

## 📍 **Ubicación:**
https://github.com/carportsv/cuzcatlansv.ride/settings/secrets/actions

## 🎯 **PASO 1: Ir a Secrets**
1. Ve a tu repositorio: https://github.com/carportsv/cuzcatlansv.ride
2. Click en **Settings** (pestaña)
3. En el menú lateral izquierdo, click en **Security**
4. Expande **Secrets and variables**
5. Click en **Actions**

## 🎯 **PASO 2: Agregar Firebase Secrets**

### **Secret 1: FIREBASE_API_KEY**
1. Click en **"New repository secret"** (botón verde)
2. **Name**: `FIREBASE_API_KEY`
3. **Value**: `AIzaSyBW7YFauqJBbv6Xm8a1tsDLGVDzF6rXHhI`
4. Click en **"Add secret"**

### **Secret 2: FIREBASE_AUTH_DOMAIN**
1. Click en **"New repository secret"**
2. **Name**: `FIREBASE_AUTH_DOMAIN`
3. **Value**: `taxi-zkt-7f276.firebaseapp.com`
4. Click en **"Add secret"**

### **Secret 3: FIREBASE_PROJECT_ID**
1. Click en **"New repository secret"**
2. **Name**: `FIREBASE_PROJECT_ID`
3. **Value**: `taxi-zkt-7f276`
4. Click en **"Add secret"**

### **Secret 4: FIREBASE_STORAGE_BUCKET**
1. Click en **"New repository secret"**
2. **Name**: `FIREBASE_STORAGE_BUCKET`
3. **Value**: `taxi-zkt-7f276.appspot.com`
4. Click en **"Add secret"**

### **Secret 5: FIREBASE_MESSAGING_SENDER_ID**
1. Click en **"New repository secret"**
2. **Name**: `FIREBASE_MESSAGING_SENDER_ID`
3. **Value**: `570692523770`
4. Click en **"Add secret"**

### **Secret 6: FIREBASE_APP_ID**
1. Click en **"New repository secret"**
2. **Name**: `FIREBASE_APP_ID`
3. **Value**: `570692523770-logva41phptcir5h5hj07pmt6vtuovhj.apps.googleusercontent.com`
4. Click en **"Add secret"**

## 🎯 **PASO 3: Agregar Supabase Secrets**

### **Secret 7: SUPABASE_URL**
1. Click en **"New repository secret"**
2. **Name**: `SUPABASE_URL`
3. **Value**: `https://wpecvlperiberbmsndlg.supabase.co`
4. Click en **"Add secret"**

### **Secret 8: SUPABASE_ANON_KEY**
1. Click en **"New repository secret"**
2. **Name**: `SUPABASE_ANON_KEY`
3. **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZWN2bHBlcmliZXJibXNuZGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzU0NDksImV4cCI6MjA2NzQxMTQ0OX0.Jx0UjYl1pblxsLXGOLSP5j0gzMyXq4arL_dzxN4YFcs`
4. Click en **"Add secret"**

## ✅ **VERIFICACIÓN:**
Después de agregar los 8 secrets, deberías ver:
- FIREBASE_API_KEY
- FIREBASE_AUTH_DOMAIN
- FIREBASE_PROJECT_ID
- FIREBASE_STORAGE_BUCKET
- FIREBASE_MESSAGING_SENDER_ID
- FIREBASE_APP_ID
- SUPABASE_URL
- SUPABASE_ANON_KEY

## 🚀 **¿Qué pasa después?**
1. **GitHub Actions se ejecutará automáticamente**
2. **Creará la rama `gh-pages`**
3. **Podrás configurar GitHub Pages**

## 🔗 **Enlaces útiles:**
- **Secrets**: https://github.com/carportsv/cuzcatlansv.ride/settings/secrets/actions
- **Pages**: https://github.com/carportsv/cuzcatlansv.ride/settings/pages
- **Actions**: https://github.com/carportsv/cuzcatlansv.ride/actions
