/**
 * Configuración de la aplicación de taxi
 * 
 * NOTA IMPORTANTE SOBRE SEGURIDAD:
 * Las claves de API se cargan desde variables de entorno para mayor seguridad.
 * En desarrollo local, estas variables se pueden configurar en un archivo .env
 * En producción, se configuran en el hosting (GitHub Pages, Netlify, etc.)
 */

// Función para obtener variables de entorno de forma segura
function getEnvVar(name, defaultValue = '') {
    // En el navegador, las variables de entorno se pueden acceder de diferentes formas
    // dependiendo del hosting (GitHub Pages, Netlify, Vercel, etc.)
    
    // Intentar obtener desde window.__ENV__ (configurado por el servidor)
    if (window.__ENV__ && window.__ENV__[name]) {
        return window.__ENV__[name];
    }
    
    // Intentar obtener desde meta tags (configurado en el HTML)
    const metaTag = document.querySelector(`meta[name="${name}"]`);
    if (metaTag) {
        return metaTag.getAttribute('content');
    }
    
    // Intentar obtener desde variables de entorno de Expo (EXPO_PUBLIC_*)
    const expoName = `EXPO_PUBLIC_${name}`;
    const expoMetaTag = document.querySelector(`meta[name="${expoName}"]`);
    if (expoMetaTag) {
        return expoMetaTag.getAttribute('content');
    }
    
    // Fallback al valor por defecto
    return defaultValue;
}

// Configuración de Firebase
const CONFIG = {
    // Configuración de Firebase
    FIREBASE_CONFIG: {
        apiKey: getEnvVar('FIREBASE_API_KEY', ''),
        authDomain: getEnvVar('FIREBASE_AUTH_DOMAIN', ''),
        projectId: getEnvVar('FIREBASE_PROJECT_ID', ''),
        storageBucket: getEnvVar('FIREBASE_STORAGE_BUCKET', ''),
        messagingSenderId: getEnvVar('FIREBASE_MESSAGING_SENDER_ID', ''),
        appId: getEnvVar('FIREBASE_APP_ID', '')
    },
    
    // Configuración de Supabase
    SUPABASE_URL: getEnvVar('SUPABASE_URL', ''),
    SUPABASE_ANON_KEY: getEnvVar('SUPABASE_ANON_KEY', ''),
    
    // Configuración de la aplicación
    APP_NAME: "cuzcatlansv.ride",
    
    // Configuración de desarrollo
    IS_DEVELOPMENT: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // URLs autorizadas para Firebase (actualizadas para hosting)
    AUTHORIZED_DOMAINS: [
        'localhost:8000',
        '127.0.0.1:8000',
        'taxi-zkt-7f276.firebaseapp.com',
        // Agregar aquí tu dominio de GitHub Pages cuando lo tengas
        // 'tu-usuario.github.io',
        // 'tu-app.netlify.app',
        // 'tu-app.vercel.app'
    ],
    
    // Claves de almacenamiento
    STORAGE_KEYS: {
        USER_UID: 'userUID',
        USER_ROLE: 'userRole',
        USER_DATA: 'userData',
        USER_NICK: 'userNick',
        USER_TOKEN: 'userToken'
    },

    // Tipos de usuario (re-added)
    USER_TYPES: {
        PASSENGER: 'passenger',
        DRIVER: 'driver',
        ADMIN: 'admin'
    },

    // Configuración de notificaciones (re-added)
    NOTIFICATIONS: {
        AUTO_HIDE_DELAY: 3000 // 3 segundos
    },

    // Configuración del mapa
    MAP_CONFIG: {
        ZOOM: 13,
        MIN_ZOOM: 10,
        MAX_ZOOM: 18,
        TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ATTRIBUTION: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    },

    // Coordenadas por defecto (San Salvador, El Salvador)
    DEFAULT_LAT: 13.6929,
    DEFAULT_LNG: -89.2182,

    // Color primario de la aplicación
    PRIMARY_COLOR: '#007bff',

    // Configuración de validaciones
    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^\+503[0-9]{8}$/,
        PASSWORD_MIN_LENGTH: 6
    }
};

// Environment detection
const ENV = {
    IS_DEVELOPMENT: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    IS_PRODUCTION: window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1',
    IS_MOBILE: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
    IS_HTTPS: window.location.protocol === 'https:',
    IS_GITHUB_PAGES: window.location.hostname.includes('github.io'),
    IS_NETLIFY: window.location.hostname.includes('netlify.app'),
    IS_VERCEL: window.location.hostname.includes('vercel.app')
};

// Debug configuration
const DEBUG = {
    ENABLED: ENV.IS_DEVELOPMENT,
    LOG_LEVEL: ENV.IS_DEVELOPMENT ? 'debug' : 'error',
    SHOW_PERFORMANCE: ENV.IS_DEVELOPMENT
};

// Utility functions for configuration
const ConfigUtils = {
    // Get configuration value with fallback
    get: (key, defaultValue = null) => {
        const keys = key.split('.');
        let value = CONFIG;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    },
    
    // Set configuration value
    set: (key, value) => {
        const keys = key.split('.');
        const lastKey = keys.pop();
        let obj = CONFIG;
        
        for (const k of keys) {
            if (!(k in obj) || typeof obj[k] !== 'object') {
                obj[k] = {};
            }
            obj = obj[k];
        }
        
        obj[lastKey] = value;
    },
    
    // Check if feature is enabled
    isFeatureEnabled: (feature) => {
        const features = {
            'realtime': true,
            'notifications': true,
            'geolocation': true,
            'offline_mode': false,
            'analytics': ENV.IS_PRODUCTION
        };
        
        return features[feature] || false;
    },
    
    // Get API URL
    getApiUrl: (endpoint) => {
        const baseUrl = CONFIG.SUPABASE_URL;
        const apiEndpoint = CONFIG.API_ENDPOINTS[endpoint] || endpoint;
        return `${baseUrl}${apiEndpoint}`;
    },
    
    // Get headers for API requests
    getHeaders: (includeAuth = true) => {
        const headers = {
            'Content-Type': 'application/json',
            'apikey': CONFIG.SUPABASE_ANON_KEY
        };
        
        if (includeAuth) {
            const token = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_TOKEN);
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        
        return headers;
    }
};

// ===== CONFIGURACIÓN DE SUPABASE =====

// Crear instancia de Supabase usando fetch API (sin necesidad de librería externa)
const supabase = {
    from: (table) => {
        return {
            select: (columns = '*') => {
                return {
                    order: (column, options = {}) => {
                                            return {
                        then: async () => {
                            try {
                                const url = `${CONFIG.SUPABASE_URL}/rest/v1/${table}`;
                                const queryParams = new URLSearchParams();
                                
                                if (columns !== '*') {
                                    queryParams.append('select', columns);
                                }
                                
                                if (options.ascending !== undefined) {
                                    queryParams.append('order', `${column}.${options.ascending ? 'asc' : 'desc'}`);
                                }
                                
                                const fullUrl = queryParams.toString() ? `${url}?${queryParams.toString()}` : url;
                                
                                const response = await fetch(fullUrl, {
                                    method: 'GET',
                                    headers: {
                                        'apikey': CONFIG.SUPABASE_ANON_KEY,
                                        'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
                                        'Content-Type': 'application/json'
                                    }
                                });
                                
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                
                                const data = await response.json();
                                return { data, error: null };
                            } catch (error) {
                                console.error('❌ Supabase: Error:', error);
                                return { data: null, error };
                            }
                        }
                    };
                    }
                };
            },
            
            delete: () => {
                return {
                    eq: (column, value) => {
                        return {
                            then: async () => {
                                try {
                                    const url = `${CONFIG.SUPABASE_URL}/rest/v1/${table}?${column}=eq.${value}`;
                                    
                                    const response = await fetch(url, {
                                        method: 'DELETE',
                                        headers: {
                                            'apikey': CONFIG.SUPABASE_ANON_KEY,
                                            'Authorization': `Bearer ${CONFIG.SUPABASE_ANON_KEY}`,
                                            'Content-Type': 'application/json'
                                        }
                                    });
                                    
                                    if (!response.ok) {
                                        throw new Error(`HTTP error! status: ${response.status}`);
                                    }
                                    
                                    return { error: null };
                                } catch (error) {
                                    return { error };
                                }
                            }
                        };
                    }
                };
            }
        };
    }
};

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ENV, DEBUG, ConfigUtils };
}

// Exponer variables globalmente para uso en otros scripts
window.CONFIG = CONFIG;
window.ENV = ENV;
window.DEBUG = DEBUG;
window.ConfigUtils = ConfigUtils;
window.supabase = supabase; 