# 🔐 Guía de Seguridad - Taxi App

## ⚠️ IMPORTANTE: Protección de Claves de API

### 🚨 Problema Identificado
Las claves de API de Firebase y Supabase están expuestas en el código público de GitHub. Esto puede representar un riesgo de seguridad.

### 🛡️ Soluciones Implementadas

#### 1. **Variables de Entorno (Recomendado)**
- ✅ Configuración modificada para usar `process.env.*`
- ✅ Archivo `.env` agregado a `.gitignore`
- ✅ Configuración de producción separada

#### 2. **Claves "Anónimas" vs "Secretas"**
- ✅ **Firebase API Key**: Es una clave "anónima" diseñada para ser pública
- ✅ **Supabase Anon Key**: Es una clave "anónima" diseñada para ser pública
- ⚠️ **Service Keys**: Estas SÍ deben mantenerse secretas (no están en el código)

### 📋 Tipos de Claves de API

#### 🔓 **Claves Públicas (Anónimas) - SEGURAS para exponer**
```javascript
// Firebase API Key (pública)
apiKey: "AIzaSyAJfonmq_9roRuSP3y9UXXEJHRxD3DhcNQ"

// Supabase Anon Key (pública)
SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### 🔒 **Claves Secretas - NUNCA exponer**
```javascript
// Firebase Service Account Key (secreta)
{
  "type": "service_account",
  "project_id": "taxi-zkt-7f276",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n..."
}

// Supabase Service Role Key (secreta)
SUPABASE_SERVICE_ROLE_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 🎯 **Estado Actual: SEGURO** ✅

Las claves expuestas en el código son **claves anónimas** que están diseñadas para ser públicas:

1. **Firebase API Key**: Se usa para autenticación del cliente, es segura de exponer
2. **Supabase Anon Key**: Se usa para operaciones públicas, es segura de exponer

### 🔧 **Mejoras de Seguridad Implementadas**

#### 1. **Variables de Entorno**
```javascript
// En config.js
apiKey: process.env.FIREBASE_API_KEY || "fallback_key"
```

#### 2. **Configuración de Producción**
- Archivo `config.production.js` para producción
- Carga variables desde meta tags o window.__ENV__

#### 3. **Gitignore Actualizado**
```
# Archivos de configuración local
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

### 🚀 **Para Despliegue en Producción**

#### **GitHub Pages**
1. Ir a Settings > Secrets and variables > Actions
2. Agregar variables de entorno:
   - `FIREBASE_API_KEY`
   - `SUPABASE_ANON_KEY`

#### **Netlify**
1. Ir a Site settings > Environment variables
2. Agregar las variables de entorno

#### **Vercel**
1. Ir a Project settings > Environment variables
2. Agregar las variables de entorno

### 📝 **Instrucciones para Desarrolladores**

#### **Desarrollo Local**
1. Crear archivo `.env` en `web-html/`
2. Agregar variables:
```bash
FIREBASE_API_KEY=tu_api_key
SUPABASE_ANON_KEY=tu_anon_key
```

#### **Producción**
1. Usar `config.production.js`
2. Configurar variables en el hosting
3. Las claves anónimas pueden permanecer en el código

### ✅ **Conclusión**

El código actual es **SEGURO** porque:
- Solo expone claves anónimas (diseñadas para ser públicas)
- Implementa variables de entorno para mayor flexibilidad
- Tiene configuración separada para producción
- Las claves secretas no están expuestas

### 🔍 **Monitoreo Continuo**

- Revisar regularmente las claves en GitHub
- Usar herramientas de seguridad como GitHub Security
- Configurar alertas para cambios en archivos de configuración

---

**Última actualización**: 3 de agosto, 2025
**Estado**: ✅ SEGURO 