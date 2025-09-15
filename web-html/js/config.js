// Configuración para GitHub Pages (producción)
// Los placeholders serán reemplazados por GitHub Actions con las claves reales
const CONFIG = {
    FIREBASE_CONFIG: {
        apiKey: "{{FIREBASE_API_KEY}}",
        authDomain: "{{FIREBASE_AUTH_DOMAIN}}",
        projectId: "{{FIREBASE_PROJECT_ID}}",
        storageBucket: "{{FIREBASE_STORAGE_BUCKET}}",
        messagingSenderId: "{{FIREBASE_MESSAGING_SENDER_ID}}",
        appId: "{{FIREBASE_APP_ID}}"
    },
    SUPABASE_URL: "{{SUPABASE_URL}}",
    SUPABASE_ANON_KEY: "{{SUPABASE_ANON_KEY}}",
    AUTHORIZED_DOMAINS: [
        'localhost:8000',
        '127.0.0.1:8000',
        'localhost',
        '127.0.0.1',
        'taxi-zkt-7f276.firebaseapp.com',
        'carportsv.github.io',
        'carportsv.github.io/zkt_openstreet'
    ]
};

// Exportar configuración
window.CONFIG = CONFIG;
console.log('✅ Configuración de GitHub Pages cargada (placeholders)');
