
// Configuración para GitHub Pages (producción)
const CONFIG = {
    FIREBASE_CONFIG: {
        apiKey: "AIzaSyBW7YFauqJBbv6Xm8a1tsDLGVDzF6rXHhI",
        authDomain: "taxi-zkt-7f276.firebaseapp.com",
        projectId: "taxi-zkt-7f276",
        storageBucket: "taxi-zkt-7f276.appspot.com",
        messagingSenderId: "570692523770",
        appId: "570692523770-logva41phptcir5h5hj07pmt6vtuovhj.apps.googleusercontent.com"
    },
    SUPABASE_URL: "https://wpecvlperiberbmsndlg.supabase.co",
    SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndwZWN2bHBlcmliZXJibXNuZGxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4MzU0NDksImV4cCI6MjA2NzQxMTQ0OX0.Jx0UjYl1pblxsLXGOLSP5j0gzMyXq4arL_dzxN4YFcs",
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
console.log('✅ Configuración de GitHub Pages cargada');
