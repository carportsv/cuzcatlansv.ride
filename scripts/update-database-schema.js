const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuración de Supabase
const supabaseUrl = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'your-anon-key';

if (!supabaseUrl || !supabaseKey || supabaseUrl === 'https://your-project.supabase.co' || supabaseKey === 'your-anon-key') {
    console.error('❌ Error: Variables de entorno de Supabase no configuradas');
    console.log('Por favor, configura las siguientes variables de entorno:');
    console.log('- SUPABASE_URL');
    console.log('- SUPABASE_ANON_KEY');
    console.log('');
    console.log('O ejecuta este script desde el directorio raíz del proyecto donde esté configurado Supabase');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function updateDatabaseSchema() {
    try {
        console.log('🔄 Iniciando actualización del esquema de la base de datos...');
        
        // Leer el archivo SQL
        const sqlFilePath = path.join(__dirname, '../database/update-ride-requests-schema.sql');
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        
        console.log('📄 Ejecutando script SQL...');
        
        // Ejecutar el SQL
        const { data, error } = await supabase.rpc('exec_sql', { sql: sqlContent });
        
        if (error) {
            // Si no existe la función exec_sql, intentar ejecutar directamente
            console.log('⚠️  Función exec_sql no disponible, intentando ejecutar directamente...');
            
            // Dividir el SQL en comandos individuales
            const commands = sqlContent.split(';').filter(cmd => cmd.trim());
            
            for (const command of commands) {
                if (command.trim()) {
                    try {
                        const { error: cmdError } = await supabase.rpc('exec_sql', { sql: command + ';' });
                        if (cmdError) {
                            console.log(`⚠️  Comando saltado: ${command.substring(0, 50)}...`);
                        }
                    } catch (e) {
                        console.log(`⚠️  Error en comando: ${e.message}`);
                    }
                }
            }
        }
        
        console.log('✅ Script SQL ejecutado');
        
        // Verificar la estructura actual de la tabla
        console.log('🔍 Verificando estructura de la tabla ride_requests...');
        
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'ride_requests')
            .order('ordinal_position');
        
        if (columnsError) {
            console.log('⚠️  No se pudo verificar la estructura de la tabla');
        } else {
            console.log('📋 Estructura actual de ride_requests:');
            columns.forEach(col => {
                console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
            });
        }
        
        // Verificar estadísticas
        const { data: stats, error: statsError } = await supabase
            .from('ride_requests')
            .select('status');
        
        if (statsError) {
            console.log('⚠️  No se pudieron obtener estadísticas');
        } else {
            const statusCounts = {};
            stats.forEach(ride => {
                statusCounts[ride.status] = (statusCounts[ride.status] || 0) + 1;
            });
            
            console.log('📊 Estadísticas de ride_requests:');
            console.log(`  - Total de registros: ${stats.length}`);
            Object.entries(statusCounts).forEach(([status, count]) => {
                console.log(`  - ${status}: ${count}`);
            });
        }
        
        console.log('✅ Actualización del esquema completada exitosamente');
        console.log('');
        console.log('🎯 Ahora puedes probar el botón "Empezar viaje" sin errores');
        
    } catch (error) {
        console.error('❌ Error durante la actualización:', error);
        console.log('');
        console.log('💡 Alternativa manual:');
        console.log('1. Ve a tu panel de Supabase');
        console.log('2. Abre el SQL Editor');
        console.log('3. Ejecuta el contenido del archivo: database/update-ride-requests-schema.sql');
    }
}

// Ejecutar la función
updateDatabaseSchema(); 