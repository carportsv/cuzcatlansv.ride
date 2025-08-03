const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase - ajusta según tu configuración
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co' || supabaseKey === 'your-anon-key') {
    console.error('❌ Error: Variables de entorno de Supabase no configuradas');
    console.log('');
    console.log('💡 Para ejecutar manualmente:');
    console.log('1. Ve a tu panel de Supabase');
    console.log('2. Abre el SQL Editor');
    console.log('3. Ejecuta estos comandos:');
    console.log('');
    console.log('ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS startedAt TIMESTAMP WITH TIME ZONE;');
    console.log('ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS etaType TEXT;');
    console.log('ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS etaDescription TEXT;');
    console.log('');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixStartedAtColumn() {
    try {
        console.log('🔄 Agregando columnas faltantes a ride_requests...');
        
        // Intentar agregar las columnas usando consultas directas
        console.log('📝 Agregando columna startedAt...');
        const { error: error1 } = await supabase.rpc('exec_sql', { 
            sql: 'ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS startedAt TIMESTAMP WITH TIME ZONE;' 
        });
        
        if (error1) {
            console.log('⚠️  No se pudo agregar startedAt automáticamente');
        } else {
            console.log('✅ Columna startedAt agregada');
        }
        
        console.log('📝 Agregando columna etaType...');
        const { error: error2 } = await supabase.rpc('exec_sql', { 
            sql: 'ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS etaType TEXT;' 
        });
        
        if (error2) {
            console.log('⚠️  No se pudo agregar etaType automáticamente');
        } else {
            console.log('✅ Columna etaType agregada');
        }
        
        console.log('📝 Agregando columna etaDescription...');
        const { error: error3 } = await supabase.rpc('exec_sql', { 
            sql: 'ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS etaDescription TEXT;' 
        });
        
        if (error3) {
            console.log('⚠️  No se pudo agregar etaDescription automáticamente');
        } else {
            console.log('✅ Columna etaDescription agregada');
        }
        
        console.log('');
        console.log('🎯 Instrucciones manuales:');
        console.log('Si los comandos automáticos fallaron, ejecuta manualmente en Supabase SQL Editor:');
        console.log('');
        console.log('ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS startedAt TIMESTAMP WITH TIME ZONE;');
        console.log('ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS etaType TEXT;');
        console.log('ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS etaDescription TEXT;');
        console.log('');
        console.log('✅ Después de ejecutar estos comandos, el botón "Empezar viaje" funcionará correctamente');
        
    } catch (error) {
        console.error('❌ Error:', error);
        console.log('');
        console.log('💡 Ejecuta manualmente en Supabase SQL Editor:');
        console.log('ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS startedAt TIMESTAMP WITH TIME ZONE;');
        console.log('ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS etaType TEXT;');
        console.log('ALTER TABLE ride_requests ADD COLUMN IF NOT EXISTS etaDescription TEXT;');
    }
}

fixStartedAtColumn(); 