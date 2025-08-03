require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Faltan variables de entorno de Supabase');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function enableRealtime() {
  console.log('🔧 Habilitando Realtime para tabla drivers...\n');

  try {
    // 1. Verificar si la publicación de Realtime existe
    console.log('📋 PASO 1: Verificar publicación de Realtime...');
    const { data: publicationData, error: publicationError } = await supabase
      .rpc('exec_sql', { sql: 'SELECT * FROM pg_publication WHERE pubname = \'supabase_realtime\';' });

    if (publicationError) {
      console.error('❌ Error verificando publicación:', publicationError);
      console.log('💡 Intentando método alternativo...');
    } else {
      console.log('✅ Publicación de Realtime encontrada:', publicationData);
    }

    // 2. Agregar la tabla drivers a la publicación de Realtime
    console.log('\n📋 PASO 2: Agregar tabla drivers a la publicación...');
    const { error: addTableError } = await supabase
      .rpc('exec_sql', { sql: 'ALTER PUBLICATION supabase_realtime ADD TABLE drivers;' });

    if (addTableError) {
      console.error('❌ Error agregando tabla a publicación:', addTableError);
      
      // Verificar si ya está agregada
      console.log('💡 Verificando si la tabla ya está en la publicación...');
      const { data: checkData, error: checkError } = await supabase
        .rpc('exec_sql', { 
          sql: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'drivers';` 
        });

      if (checkError) {
        console.error('❌ Error verificando tabla en publicación:', checkError);
      } else if (checkData && checkData.length > 0) {
        console.log('✅ Tabla drivers ya está en la publicación de Realtime');
      } else {
        console.log('⚠️ Tabla drivers no está en la publicación');
      }
    } else {
      console.log('✅ Tabla drivers agregada a la publicación de Realtime');
    }

    // 3. Verificar todas las tablas en la publicación
    console.log('\n📋 PASO 3: Verificar todas las tablas en la publicación...');
    const { data: tablesData, error: tablesError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT schemaname, tablename, pubname FROM pg_publication_tables WHERE pubname = 'supabase_realtime' ORDER BY tablename;` 
      });

    if (tablesError) {
      console.error('❌ Error verificando tablas en publicación:', tablesError);
    } else {
      console.log('📊 Tablas en publicación de Realtime:');
      if (tablesData && tablesData.length > 0) {
        tablesData.forEach(table => {
          console.log(`  - ${table.schemaname}.${table.tablename}`);
        });
      } else {
        console.log('  No hay tablas en la publicación');
      }
    }

    // 4. Crear trigger de prueba para debugging
    console.log('\n📋 PASO 4: Crear trigger de prueba para debugging...');
    const { error: triggerError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          CREATE OR REPLACE FUNCTION log_driver_changes()
          RETURNS TRIGGER AS $$
          BEGIN
              RAISE NOTICE 'Driver change detected: % % %', TG_OP, OLD.id, NEW.id;
              RETURN COALESCE(NEW, OLD);
          END;
          $$ LANGUAGE plpgsql;
        ` 
      });

    if (triggerError) {
      console.error('❌ Error creando función de trigger:', triggerError);
    } else {
      console.log('✅ Función de trigger creada');
    }

    const { error: createTriggerError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          DROP TRIGGER IF EXISTS driver_changes_trigger ON drivers;
          CREATE TRIGGER driver_changes_trigger
              AFTER INSERT OR UPDATE OR DELETE ON drivers
              FOR EACH ROW EXECUTE FUNCTION log_driver_changes();
        ` 
      });

    if (createTriggerError) {
      console.error('❌ Error creando trigger:', createTriggerError);
    } else {
      console.log('✅ Trigger de prueba creado');
    }

    // 5. Verificar configuración final
    console.log('\n📋 PASO 5: Verificar configuración final...');
    const { data: finalCheck, error: finalError } = await supabase
      .rpc('exec_sql', { 
        sql: `SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'drivers';` 
      });

    if (finalError) {
      console.error('❌ Error en verificación final:', finalError);
    } else if (finalCheck && finalCheck.length > 0) {
      console.log('✅ CONFIGURACIÓN EXITOSA: Tabla drivers está en la publicación de Realtime');
    } else {
      console.log('❌ CONFIGURACIÓN FALLIDA: Tabla drivers no está en la publicación');
    }

    console.log('\n📋 INSTRUCCIONES:');
    console.log('1. Ve a Supabase Dashboard > Database > Replication');
    console.log('2. Verifica que "Realtime" esté habilitado');
    console.log('3. Verifica que la tabla "drivers" aparezca en la lista');
    console.log('4. Ejecuta el script de prueba: node test-app-simulation.js');

  } catch (error) {
    console.error('❌ Error en habilitación de Realtime:', error);
  }
}

enableRealtime().then(() => {
  console.log('\n🎉 Proceso de habilitación completado');
  process.exit(0);
}).catch(error => {
  console.error('❌ Error en proceso:', error);
  process.exit(1);
}); 