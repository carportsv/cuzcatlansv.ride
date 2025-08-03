const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

// Inicializar Firebase Admin
// Nota: Para usar Firebase Admin, necesitas un archivo de credenciales de servicio
// Por ahora, usaremos las credenciales del proyecto
const serviceAccount = {
  type: "service_account",
  project_id: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL
};

// Inicializar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateFirebaseUsers() {
  console.log('🔍 Consultando usuarios de Firebase...');

  try {
    // Listar usuarios de Firebase
    const listUsersResult = await admin.auth().listUsers();
    
    console.log(`📊 Usuarios encontrados en Firebase: ${listUsersResult.users.length}`);
    
    for (const firebaseUser of listUsersResult.users) {
      console.log(`\n👤 Usuario: ${firebaseUser.uid}`);
      console.log(`   Email: ${firebaseUser.email || 'Sin email'}`);
      console.log(`   Teléfono: ${firebaseUser.phoneNumber || 'Sin teléfono'}`);
      console.log(`   Display Name: ${firebaseUser.displayName || 'Sin nombre'}`);
      console.log(`   Creado: ${firebaseUser.metadata.creationTime}`);
      
      // Verificar si ya existe en Supabase
      const { data: existingUser, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('firebase_uid', firebaseUser.uid);

      if (userError) {
        console.error(`❌ Error verificando usuario ${firebaseUser.uid}:`, userError);
        continue;
      }

      if (!existingUser || existingUser.length === 0) {
        console.log(`📝 Creando usuario en Supabase...`);
        
        // Crear usuario en Supabase
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            firebase_uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            display_name: firebaseUser.displayName || 'Usuario',
            phone_number: firebaseUser.phoneNumber || '',
            role: 'user' // Por defecto como usuario
          })
          .select()
          .single();

        if (createError) {
          console.error(`❌ Error creando usuario ${firebaseUser.uid}:`, createError);
        } else {
          console.log(`✅ Usuario creado en Supabase: ${newUser.display_name}`);
        }
      } else {
        console.log(`✅ Usuario ya existe en Supabase: ${existingUser[0].display_name}`);
      }
    }

    console.log('\n🎉 Migración de usuarios completada');
    
    // Verificar usuarios en Supabase
    const { data: supabaseUsers, error: supabaseError } = await supabase
      .from('users')
      .select('*');

    if (supabaseError) {
      console.error('❌ Error verificando usuarios en Supabase:', supabaseError);
    } else {
      console.log(`📊 Total usuarios en Supabase: ${supabaseUsers?.length || 0}`);
      supabaseUsers?.forEach(user => {
        console.log(`  - ${user.display_name} (${user.role}) - ${user.firebase_uid}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en migración:', error);
    console.log('💡 Para usar Firebase Admin, necesitas configurar las credenciales de servicio');
    console.log('💡 Puedes obtenerlas desde Firebase Console > Project Settings > Service Accounts');
  }
}

migrateFirebaseUsers(); 