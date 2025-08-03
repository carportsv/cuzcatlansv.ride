const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Roles originales de Firebase (basados en las imágenes que me mostraste)
const originalRoles = {
  'jbH43kh2FrYiBduwuaatkReA85o1': 'admin',    // Tu usuario
  'yeEovAIpw9MWchXYrUErJFTbgyV2': 'user',     // Veronica Alfaro
  'PO50dbcOFVTJoiA7MouHlnTEGAV2': 'user',     // Fred Wicket
  'fxOYcrZdCfhoPcVCqBAMVUvnN8k2': 'user'      // group cbw
};

async function revertUserRoles() {
  console.log('🔄 Revirtiendo roles de usuario a sus valores originales de Firebase...');

  try {
    for (const [firebaseUid, originalRole] of Object.entries(originalRoles)) {
      console.log(`\n👤 Procesando: ${firebaseUid} -> ${originalRole}`);
      
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUid);

      if (userError) {
        console.error(`❌ Error obteniendo usuario ${firebaseUid}:`, userError);
        continue;
      }

      if (!user || user.length === 0) {
        console.log(`⚠️ Usuario ${firebaseUid} no encontrado en Supabase`);
        continue;
      }

      const currentUser = user[0];
      console.log(`   Usuario actual: ${currentUser.display_name} (${currentUser.role})`);

      if (currentUser.role !== originalRole) {
        console.log(`🔄 Cambiando rol de ${currentUser.role} a ${originalRole}...`);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: originalRole })
          .eq('firebase_uid', firebaseUid);

        if (updateError) {
          console.error(`❌ Error actualizando rol:`, updateError);
        } else {
          console.log(`✅ Rol actualizado a ${originalRole}`);
          
          // Si cambió de driver a otro rol, eliminar perfil de conductor
          if (currentUser.role === 'driver' && originalRole !== 'driver') {
            console.log(`🗑️ Eliminando perfil de conductor...`);
            
            const { error: deleteDriverError } = await supabase
              .from('drivers')
              .delete()
              .eq('user_id', currentUser.id);

            if (deleteDriverError) {
              console.error(`❌ Error eliminando conductor:`, deleteDriverError);
            } else {
              console.log(`✅ Perfil de conductor eliminado`);
            }
          }
        }
      } else {
        console.log(`✅ Rol ya es correcto: ${originalRole}`);
      }
    }

    console.log('\n🎉 Roles revertidos a valores originales');
    
    // Verificar estado final
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*');

    if (finalError) {
      console.error('❌ Error verificando usuarios finales:', finalError);
    } else {
      console.log(`\n📊 Estado final de usuarios en Supabase: ${finalUsers?.length || 0}`);
      finalUsers?.forEach(user => {
        console.log(`  - ${user.display_name} (${user.role}) - ${user.firebase_uid}`);
      });
    }

    // Verificar conductores
    const { data: finalDrivers, error: driverFinalError } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(display_name, firebase_uid, role)
      `);

    if (driverFinalError) {
      console.error('❌ Error verificando conductores finales:', driverFinalError);
    } else {
      console.log(`\n🚗 Conductores finales en Supabase: ${finalDrivers?.length || 0}`);
      finalDrivers?.forEach(driver => {
        console.log(`  - ${driver.user?.display_name} (${driver.user?.role}) - ${driver.user?.firebase_uid}`);
      });
    }

  } catch (error) {
    console.error('❌ Error revirtiendo roles:', error);
  }
}

revertUserRoles(); 