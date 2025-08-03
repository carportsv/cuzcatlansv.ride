/**
 * Configuración de la aplicación de taxi
 * 
 * NOTA IMPORTANTE SOBRE GOOGLE SIGN-IN:
 * Si ves el error "API_KEY_HTTP_REFERRER_BLOCKED" al intentar usar Google Sign-In,
 * necesitas configurar los dominios autorizados en Firebase Console:
 * 
 * 1. Ve a Firebase Console > Authentication > Settings > Authorized domains
 * 2. Agrega los siguientes dominios:
 *    - localhost (para desarrollo local)
 *    - 127.0.0.1 (para desarrollo local)
 *    - tu-dominio.com (para producción)
 * 
 * Este error no se puede resolver programáticamente y requiere configuración manual.
 */

// Configuración de Firebase
const CONFIG = {
    // Configuración de Firebase
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyAJfonmq_9roRuSP3y9UXXEJHRxD3DhcNQ",
        authDomain: "taxi-zkt-7f276.firebaseapp.com",
        projectId: "taxi-zkt-7f276",
        storageBucket: "taxi-zkt-7f276.appspot.com",
        messagingSenderId: "570692523770",
        appId: "1:570692523770:web:26e5ad5e0c0ded43331b43"
    },
    
    // Configuración de Supabase
    SUPABASE_URL: "https://wpecvlperiberbmsndlg.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZWN2bHBlcmliZXJibXNuZGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzU0NDksImV4cCI6MjA2NzQxMTQ0OX0.Jx0UjYl1pblxsLXGOLSP5j0gzMyXq4arL_dzxN4YFcs",
    
    // Configuración de la aplicación
    APP_NAME: "cuzcatlansv.ride",
    
    // Configuración de desarrollo
    IS_DEVELOPMENT: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1',
    
    // URLs autorizadas para Firebase
    AUTHORIZED_DOMAINS: [
        'localhost:8000',
        '127.0.0.1:8000',
        'taxi-zkt-7f276.firebaseapp.com'
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
    IS_HTTPS: window.location.protocol === 'https:'
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

// Export configuration for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CONFIG, ENV, DEBUG, ConfigUtils };
} 