// Configuración de desarrollo local para Cuzcatlansv.ride
// Este archivo contiene configuraciones básicas para desarrollo

// Configuración de la aplicación
const CONFIG = {
    // Supabase Configuration - Cargar desde config.env.json
    SUPABASE_URL: '{{EXPO_PUBLIC_SUPABASE_URL}}',
    SUPABASE_ANON_KEY: '{{EXPO_PUBLIC_SUPABASE_ANON_KEY}}',

    // Firebase Configuration - Cargar desde config.env.json
    FIREBASE_CONFIG: {
        apiKey: "{{FIREBASE_API_KEY}}",
        authDomain: "{{FIREBASE_AUTH_DOMAIN}}",
        projectId: "{{FIREBASE_PROJECT_ID}}",
        storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
        messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
        appId: "{{FIREBASE_APP_ID}}"
    },
    
    // OpenStreetMap Configuration
    NOMINATIM_BASE_URL: 'https://nominatim.openstreetmap.org',
    OSRM_BASE_URL: 'https://router.project-osrm.org',
    
    // App Configuration
    APP_NAME: 'Cuzcatlansv.ride',
    APP_VERSION: '1.0.0',
    
    // Default coordinates (San Salvador, El Salvador)
    DEFAULT_LAT: 13.6929,
    DEFAULT_LNG: -89.2182,
    
    // Development settings
    DEVELOPMENT: {
        ENABLE_CONSOLE_LOGS: true,
        MOCK_AUTHENTICATION: false,
        MOCK_LOCATION: false,
        DEBUG_MODE: true
    },
    
    // API Endpoints
    API_ENDPOINTS: {
        // Supabase endpoints
        AUTH: '/auth/v1',
        REST: '/rest/v1',
        REALTIME: '/realtime/v1',
        
        // Custom endpoints
        SEARCH_ADDRESS: '/api/search-address',
        CREATE_RIDE: '/api/rides',
        UPDATE_RIDE: '/api/rides',
        GET_DRIVERS: '/api/drivers',
        GET_USER_PROFILE: '/api/user/profile',
        UPDATE_USER_PROFILE: '/api/user/profile'
    },
    
    // Realtime channels
    REALTIME_CHANNELS: {
        RIDES: 'rides',
        DRIVER_LOCATIONS: 'driver_locations',
        NOTIFICATIONS: 'notifications'
    },
    
    // Map settings
    MAP_SETTINGS: {
        DEFAULT_ZOOM: 13,
        MIN_ZOOM: 10,
        MAX_ZOOM: 18,
        TILE_LAYER: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        ATTRIBUTION: '© OpenStreetMap contributors'
    },
    
    // Authentication settings
    AUTH_SETTINGS: {
        ENABLE_PHONE_AUTH: true,
        ENABLE_GOOGLE_AUTH: true,
        ENABLE_EMAIL_AUTH: true,
        PHONE_AUTH_TIMEOUT: 60000, // 60 seconds
        SESSION_TIMEOUT: 86400000 // 24 hours
    },

    // LocalStorage keys usados por auth.js (evita errores de undefined)
    STORAGE_KEYS: {
        USER_DATA: 'taxi_web_user_data',
        USER_TOKEN: 'taxi_web_user_token',
        USER_UID: 'taxi_web_user_uid',
        USER_ROLE: 'taxi_web_user_role'
    },

    // Reglas de validación usadas por auth.js
    VALIDATION: {
        EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        PHONE_REGEX: /^\+?\d{8,15}$/,
        PASSWORD_MIN_LENGTH: 6
    },
    
    // Configuración de tarifas por defecto
    PRICING: {
        BASE_FARE: 2.50,
        PER_KM_RATE: 0.80,
        PER_MINUTE_RATE: 0.10,
        MINIMUM_FARE: 2.50,
        CURRENCY: 'USD'
    }
};

// Configuración cargada desde config.override.js (sin intentar cargar config.env.json)

// Función para aplicar CONFIG_ENV
function applyConfigEnv() {
    if (window.CONFIG_ENV && typeof window.CONFIG_ENV === 'object') {
        try {
            if (window.CONFIG_ENV.FIREBASE_CONFIG) {
                CONFIG.FIREBASE_CONFIG = { ...CONFIG.FIREBASE_CONFIG, ...window.CONFIG_ENV.FIREBASE_CONFIG };
            }
            if (window.CONFIG_ENV.SUPABASE_URL) {
                CONFIG.SUPABASE_URL = window.CONFIG_ENV.SUPABASE_URL;
            }
            if (window.CONFIG_ENV.SUPABASE_ANON_KEY) {
                CONFIG.SUPABASE_ANON_KEY = window.CONFIG_ENV.SUPABASE_ANON_KEY;
            }
            console.log('🔌 Config aplicada desde CONFIG_ENV');
        console.log('🔐 Supabase URL:', window.CONFIG_ENV.SUPABASE_URL ? '✅ Configurada' : '❌ No configurada');
        console.log('🔑 Supabase Key:', window.CONFIG_ENV.SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ No configurada');
        } catch (error) {
            console.error('❌ Error aplicando CONFIG_ENV:', error);
        }
    }
}

// Alias esperado por maps.js (compatibilidad)
CONFIG.MAP_CONFIG = {
    ZOOM: CONFIG.MAP_SETTINGS.DEFAULT_ZOOM,
    MIN_ZOOM: CONFIG.MAP_SETTINGS.MIN_ZOOM,
    MAX_ZOOM: CONFIG.MAP_SETTINGS.MAX_ZOOM,
    TILE_LAYER: CONFIG.MAP_SETTINGS.TILE_LAYER,
    ATTRIBUTION: CONFIG.MAP_SETTINGS.ATTRIBUTION,
};

// Detectar entorno y ajustar configuración
function detectEnvironment() {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
        console.log('✅ Configuración LOCAL cargada (desarrollo)');
        console.log('🌐 Entorno:', hostname);
        console.log('🔧 Modo desarrollo:', CONFIG.DEVELOPMENT.DEBUG_MODE);
        return 'development';
    } else if (hostname.includes('github.io')) {
        console.log('✅ Configuración GITHUB PAGES cargada (producción)');
        return 'production';
    } else {
        console.log('✅ Configuración CUSTOM cargada');
        return 'custom';
    }
}

// Inicializar configuración
CONFIG.ENVIRONMENT = detectEnvironment();

// Intentar cargar variables desde un JSON local (generado desde .env)
// Nota: uso de XHR síncrono intencional para asegurar disponibilidad antes del resto de scripts
try {
    var xhr = new XMLHttpRequest();
    // Determinar la ruta correcta basada en la ubicación actual
    var currentPath = window.location.pathname;
    var configPath;
    
    // Determinar la ruta correcta basada en la ubicación actual
    if (currentPath.includes('/ride-management/') || 
        currentPath.includes('/create-ride/') || 
        currentPath.includes('/drivers/') || 
        currentPath.includes('/reports/') ||
        currentPath.includes('/configuration/') ||
        currentPath.includes('/auth/') ||
        currentPath.includes('/home/')) {
        configPath = '../config.env.json';
    } else if (currentPath === '/' || currentPath === '/index.html' || currentPath.endsWith('/')) {
        configPath = 'config.env.json';
    } else {
        // Para cualquier otra ruta, intentar desde la raíz
        configPath = 'config.env.json';
    }
    
    console.log('🔍 Intentando cargar config desde:', configPath, 'para ruta:', currentPath);
    
    xhr.open('GET', configPath, false); // síncrono
    xhr.send(null);
    
    if (xhr.status === 200 && xhr.responseText) {
        // Verificar que la respuesta sea JSON válido
        try {
            var responseText = xhr.responseText.trim();
            if (responseText.startsWith('{') && responseText.endsWith('}')) {
                window.CONFIG_ENV = JSON.parse(responseText);
                console.log('🔌 Config cargada desde config.env.json');
                // Aplicar la configuración inmediatamente después de cargarla
                applyConfigEnv();
            } else {
                console.log('⚠️ Respuesta no es JSON válido desde:', configPath);
                console.log('📄 Respuesta recibida:', responseText.substring(0, 100) + '...');
            }
        } catch (parseError) {
            console.log('⚠️ Error parseando JSON desde:', configPath, parseError.message);
        }
    } else {
        console.log('⚠️ No se pudo cargar config.env.json desde:', configPath, 'Status:', xhr.status);
    }
} catch (e) {
    console.log('⚠️ Error cargando config.env.json:', e.message);
}

// Log de configuración
console.log('✅ Configuración LOCAL cargada (desarrollo)');
console.log('🌐 Entorno: localhost');
console.log('🔧 Modo desarrollo: true');

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} else {
    window.CONFIG = CONFIG;
}
