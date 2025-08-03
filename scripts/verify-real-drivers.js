const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Lista de usuarios reales de Firebase con sus roles correctos
// Basado en las imágenes de Firebase que confirmaron los roles originales
const realFirebaseUsers = [
  {
    uid: 'jbH43kh2FrYiBduwuaatkReA85o1',
    email: '',
    displayName: 'Usuario Principal',
    phoneNumber: '+50370346370',
    role: 'admin', // Era admin en Firebase original
    wasDriver: false
  },
  {
    uid: 'yeEovAIpw9MWchXYrUErJFTbgyV2',
    email: 'veramy1982@gmail.com',
    displayName: 'Veronica Alfaro',
    phoneNumber: '',
    role: 'user', // Era user en Firebase original
    wasDriver: false
  },
  {
    uid: 'PO50dbcOFVTJoiA7MouHlnTEGAV2',
    email: 'fred.wicket.us@gmail.com',
    displayName: 'Fred Wicket',
    phoneNumber: '',
    role: 'user', // Era user en Firebase original
    wasDriver: false
  }
];

async function verifyRealDrivers() {
  console.log('🔍 Verificando roles correctos de usuarios reales de Firebase...');

  try {
    for (const firebaseUser of realFirebaseUsers) {
      console.log(`\n👤 Procesando: ${firebaseUser.displayName}`);
      console.log(`   Firebase UID: ${firebaseUser.uid}`);
      console.log(`   Rol actual en Supabase: ?`);
      console.log(`   Rol correcto: ${firebaseUser.role}`);
      console.log(`   Era conductor originalmente: ${firebaseUser.wasDriver ? 'Sí' : 'No'}`);
      
      // Verificar rol actual en Supabase
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid);

      if (userError) {
        console.error(`❌ Error verificando usuario ${firebaseUser.uid}:`, userError);
        continue;
      }

      if (!existingUser || existingUser.length === 0) {
        console.log(`❌ Usuario ${firebaseUser.displayName} no encontrado en Supabase`);
        continue;
      }

      const user = existingUser[0];
      console.log(`   Rol actual en Supabase: ${user.role}`);
      
      // Actualizar rol si es diferente
      if (user.role !== firebaseUser.role) {
        console.log(`🔄 Actualizando rol de ${user.role} a ${firebaseUser.role}...`);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ role: firebaseUser.role })
          .eq('firebase_uid', firebaseUser.uid);

        if (updateError) {
          console.error(`❌ Error actualizando rol:`, updateError);
        } else {
          console.log(`✅ Rol actualizado a ${firebaseUser.role}`);
          
          // Si cambió de driver a user, eliminar perfil de conductor
          if (user.role === 'driver' && firebaseUser.role === 'user') {
            console.log(`🗑️ Eliminando perfil de conductor para: ${firebaseUser.displayName}`);
            
            const { error: deleteDriverError } = await supabase
              .from('drivers')
              .delete()
              .eq('user_id', user.id);

            if (deleteDriverError) {
              console.error(`❌ Error eliminando conductor:`, deleteDriverError);
            } else {
              console.log(`✅ Perfil de conductor eliminado`);
            }
          }
        }
      } else {
        console.log(`✅ Rol ya es correcto: ${firebaseUser.role}`);
      }
    }

    console.log('\n🎉 Verificación completada');
    
    // Verificar estado final
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*');

    if (finalError) {
      console.error('❌ Error verificando usuarios finales:', finalError);
    } else {
      console.log(`\n📊 Estado final de usuarios en Supabase:`);
      finalUsers?.forEach(user => {
        console.log(`  - ${user.display_name} (${user.role}) - ${user.firebase_uid}`);
      });
    }

    // Verificar conductores finales
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
    console.error('❌ Error en verificación:', error);
  }
}

verifyRealDrivers(); 