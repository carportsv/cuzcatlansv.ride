const { createClient } = require('@supabase/supabase-js');
const admin = require('firebase-admin');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Inicializar Firebase Admin SDK
// Necesitamos las credenciales del service account
let firebaseApp;

try {
  // Intentar usar las credenciales del service account si están disponibles
  const serviceAccount = require('../firebase-service-account.json');
  
  firebaseApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('✅ Firebase Admin SDK inicializado con service account');
} catch (error) {
  console.log('⚠️ No se encontró service account, usando credenciales de entorno...');
  
  // Alternativa: usar variables de entorno
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  if (projectId && privateKey && clientEmail) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        privateKey,
        clientEmail
      })
    });
    console.log('✅ Firebase Admin SDK inicializado con variables de entorno');
  } else {
    console.error('❌ Error: No se encontraron credenciales de Firebase Admin SDK');
    console.log('📋 Para obtener usuarios de Firebase, necesitas:');
    console.log('   1. Descargar el service account key desde Firebase Console');
    console.log('   2. Guardarlo como firebase-service-account.json en la raíz del proyecto');
    console.log('   O configurar las variables de entorno:');
    console.log('   - FIREBASE_PROJECT_ID');
    console.log('   - FIREBASE_PRIVATE_KEY');
    console.log('   - FIREBASE_CLIENT_EMAIL');
    process.exit(1);
  }
}

async function getRealFirebaseUsers() {
  console.log('🔍 Obteniendo usuarios reales de Firebase...');

  try {
    // Obtener todos los usuarios de Firebase Auth
    const listUsersResult = await admin.auth().listUsers();
    const firebaseUsers = listUsersResult.users;

    console.log(`📊 Encontrados ${firebaseUsers.length} usuarios en Firebase Auth`);

    // Obtener datos adicionales de Firestore para cada usuario
    const firestore = admin.firestore();
    const usersWithRoles = [];

    for (const authUser of firebaseUsers) {
      console.log(`\n👤 Procesando: ${authUser.displayName || authUser.email || authUser.uid}`);
      
      try {
        // Obtener datos del usuario desde Firestore
        const userDoc = await firestore.collection('users').doc(authUser.uid).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          console.log(`   📄 Datos encontrados en Firestore`);
          console.log(`   - Nombre: ${userData.name || userData.displayName || 'Sin nombre'}`);
          console.log(`   - Email: ${userData.email || authUser.email || 'Sin email'}`);
          console.log(`   - Teléfono: ${userData.phone || userData.phoneNumber || 'Sin teléfono'}`);
          console.log(`   - Rol: ${userData.role || 'Sin rol'}`);
          
          usersWithRoles.push({
            uid: authUser.uid,
            email: userData.email || authUser.email || '',
            displayName: userData.name || userData.displayName || authUser.displayName || 'Usuario',
            phoneNumber: userData.phone || userData.phoneNumber || '',
            role: userData.role || 'user',
            firestoreData: userData
          });
        } else {
          console.log(`   ⚠️ No se encontraron datos en Firestore`);
          usersWithRoles.push({
            uid: authUser.uid,
            email: authUser.email || '',
            displayName: authUser.displayName || 'Usuario',
            phoneNumber: '',
            role: 'user',
            firestoreData: null
          });
        }
      } catch (firestoreError) {
        console.error(`   ❌ Error obteniendo datos de Firestore:`, firestoreError.message);
        // Incluir usuario solo con datos de Auth
        usersWithRoles.push({
          uid: authUser.uid,
          email: authUser.email || '',
          displayName: authUser.displayName || 'Usuario',
          phoneNumber: '',
          role: 'user',
          firestoreData: null
        });
      }
    }

    console.log(`\n📋 Usuarios procesados: ${usersWithRoles.length}`);
    
    // Mostrar resumen
    const roleCounts = {};
    usersWithRoles.forEach(user => {
      roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
    });
    
    console.log('\n📊 Resumen por roles:');
    Object.entries(roleCounts).forEach(([role, count]) => {
      console.log(`   - ${role}: ${count} usuarios`);
    });

    // Migrar a Supabase
    await migrateToSupabase(usersWithRoles);

  } catch (error) {
    console.error('❌ Error obteniendo usuarios de Firebase:', error);
  }
}

async function migrateToSupabase(firebaseUsers) {
  console.log('\n🚀 Migrando usuarios a Supabase...');

  try {
    for (const firebaseUser of firebaseUsers) {
      console.log(`\n👤 Migrando: ${firebaseUser.displayName} (${firebaseUser.role})`);
      
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
            email: firebaseUser.email,
            display_name: firebaseUser.displayName,
            phone_number: firebaseUser.phoneNumber,
            role: firebaseUser.role
          })
          .select()
          .single();

        if (createError) {
          console.error(`❌ Error creando usuario ${firebaseUser.uid}:`, createError);
        } else {
          console.log(`✅ Usuario creado en Supabase: ${newUser.display_name}`);
          
          // Si es conductor, crear perfil de conductor
          if (firebaseUser.role === 'driver') {
            await createDriverProfile(newUser.id, firebaseUser.displayName, firebaseUser.firestoreData);
          }
        }
      } else {
        console.log(`✅ Usuario ya existe en Supabase: ${existingUser[0].display_name}`);
        
        // Actualizar si es necesario
        if (existingUser[0].role !== firebaseUser.role) {
          console.log(`🔄 Actualizando rol de ${existingUser[0].role} a ${firebaseUser.role}...`);
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              role: firebaseUser.role,
              display_name: firebaseUser.displayName,
              email: firebaseUser.email,
              phone_number: firebaseUser.phoneNumber
            })
            .eq('firebase_uid', firebaseUser.uid);

          if (updateError) {
            console.error(`❌ Error actualizando rol:`, updateError);
          } else {
            console.log(`✅ Rol actualizado a ${firebaseUser.role}`);
            
            // Si ahora es conductor, crear perfil de conductor
            if (firebaseUser.role === 'driver') {
              await createDriverProfile(existingUser[0].id, firebaseUser.displayName, firebaseUser.firestoreData);
            }
          }
        }
      }
    }

    console.log('\n🎉 Migración completada');
    
    // Verificar estado final
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*');

    if (finalError) {
      console.error('❌ Error verificando usuarios finales:', finalError);
    } else {
      console.log(`\n📊 Usuarios finales en Supabase: ${finalUsers?.length || 0}`);
      finalUsers?.forEach(user => {
        console.log(`  - ${user.display_name} (${user.role}) - ${user.firebase_uid}`);
      });
    }

  } catch (error) {
    console.error('❌ Error en migración:', error);
  }
}

async function createDriverProfile(userId, displayName, firestoreData) {
  console.log(`📝 Creando perfil de conductor para: ${displayName}`);
  
  // Usar datos de Firestore si están disponibles
  const driverData = {
    user_id: userId,
    is_available: true,
    status: 'active',
    location: firestoreData?.location || {
      latitude: 13.7942 + (Math.random() - 0.5) * 0.01,
      longitude: -88.8965 + (Math.random() - 0.5) * 0.01
    },
    rating: 4.5 + Math.random() * 0.5,
    total_rides: Math.floor(Math.random() * 100) + 50,
    earnings: Math.floor(Math.random() * 1000) + 500,
    car_info: {
      model: firestoreData?.carModel || ['Toyota Corolla', 'Honda Civic', 'Nissan Sentra'][Math.floor(Math.random() * 3)],
      plate: firestoreData?.carPlate || ['ABC-123', 'XYZ-789', 'DEF-456'][Math.floor(Math.random() * 3)],
      year: 2019 + Math.floor(Math.random() * 3)
    },
    documents: {
      license: firestoreData?.license || 'LIC-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      insurance: 'INS-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      registration: 'REG-' + Math.random().toString(36).substr(2, 8).toUpperCase()
    }
  };

  const { error: driverError } = await supabase
    .from('drivers')
    .insert(driverData);

  if (driverError) {
    console.error(`❌ Error creando conductor para ${displayName}:`, driverError);
  } else {
    console.log(`✅ Conductor creado para: ${displayName}`);
    console.log(`   - Vehículo: ${driverData.car_info.model} ${driverData.car_info.year}`);
    console.log(`   - Placa: ${driverData.car_info.plate}`);
    console.log(`   - Calificación: ${driverData.rating.toFixed(1)}`);
  }
}

getRealFirebaseUsers(); 