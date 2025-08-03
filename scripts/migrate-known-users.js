const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Usuarios conocidos de Firebase (simulados)
const knownFirebaseUsers = [
  {
    uid: 'jbH43kh2FrYiBduwuaatkReA85o1',
    email: '',
    displayName: 'Usuario Principal',
    phoneNumber: '+50370346370',
    role: 'driver' // Convertir a conductor
  },
  {
    uid: 'driver_1_firebase_uid',
    email: 'carlos.mendoza@example.com',
    displayName: 'Carlos Mendoza',
    phoneNumber: '+503 7123-4567',
    role: 'driver'
  },
  {
    uid: 'driver_2_firebase_uid',
    email: 'maria.lopez@example.com',
    displayName: 'María López',
    phoneNumber: '+503 7123-4568',
    role: 'driver'
  },
  {
    uid: 'driver_3_firebase_uid',
    email: 'juan.perez@example.com',
    displayName: 'Juan Pérez',
    phoneNumber: '+503 7123-4569',
    role: 'driver'
  },
  {
    uid: 'user_1_firebase_uid',
    email: 'usuario1@example.com',
    displayName: 'Usuario Regular 1',
    phoneNumber: '+503 7123-4570',
    role: 'user'
  },
  {
    uid: 'user_2_firebase_uid',
    email: 'usuario2@example.com',
    displayName: 'Usuario Regular 2',
    phoneNumber: '+503 7123-4571',
    role: 'user'
  }
];

async function migrateKnownUsers() {
  console.log('🔍 Migrando usuarios conocidos de Firebase a Supabase...');

  try {
    for (const firebaseUser of knownFirebaseUsers) {
      console.log(`\n👤 Procesando usuario: ${firebaseUser.uid}`);
      console.log(`   Nombre: ${firebaseUser.displayName}`);
      console.log(`   Email: ${firebaseUser.email || 'Sin email'}`);
      console.log(`   Teléfono: ${firebaseUser.phoneNumber}`);
      console.log(`   Rol: ${firebaseUser.role}`);
      
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
            await createDriverProfile(newUser.id, firebaseUser.displayName);
          }
        }
      } else {
        console.log(`✅ Usuario ya existe en Supabase: ${existingUser[0].display_name}`);
        
        // Actualizar rol si es necesario
        if (existingUser[0].role !== firebaseUser.role) {
          console.log(`🔄 Actualizando rol de ${existingUser[0].role} a ${firebaseUser.role}...`);
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ role: firebaseUser.role })
            .eq('firebase_uid', firebaseUser.uid);

          if (updateError) {
            console.error(`❌ Error actualizando rol:`, updateError);
          } else {
            console.log(`✅ Rol actualizado a ${firebaseUser.role}`);
            
            // Si ahora es conductor, crear perfil de conductor
            if (firebaseUser.role === 'driver') {
              await createDriverProfile(existingUser[0].id, firebaseUser.displayName);
            }
          }
        }
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

    // Verificar conductores
    const { data: drivers, error: driverError } = await supabase
      .from('drivers')
      .select(`
        *,
        user:users(display_name, phone_number)
      `);

    if (driverError) {
      console.error('❌ Error verificando conductores:', driverError);
    } else {
      console.log(`\n🚗 Conductores en Supabase: ${drivers?.length || 0}`);
      drivers?.forEach(driver => {
        console.log(`  - ${driver.user?.display_name} (${driver.car_info?.model} ${driver.car_info?.year})`);
      });
    }

  } catch (error) {
    console.error('❌ Error en migración:', error);
  }
}

async function createDriverProfile(userId, displayName) {
  console.log(`📝 Creando perfil de conductor para: ${displayName}`);
  
  const driverData = {
    user_id: userId,
    is_available: true,
    status: 'active',
    location: {
      latitude: 13.7942 + (Math.random() - 0.5) * 0.01,
      longitude: -88.8965 + (Math.random() - 0.5) * 0.01
    },
    rating: 4.5 + Math.random() * 0.5,
    total_rides: Math.floor(Math.random() * 100) + 50,
    earnings: Math.floor(Math.random() * 1000) + 500,
    car_info: {
      model: ['Toyota Corolla', 'Honda Civic', 'Nissan Sentra'][Math.floor(Math.random() * 3)],
      plate: ['ABC-123', 'XYZ-789', 'DEF-456'][Math.floor(Math.random() * 3)],
      year: 2019 + Math.floor(Math.random() * 3)
    },
    documents: {
      license: 'LIC-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      insurance: 'INS-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
      registration: 'REG-' + Math.random().toString(36).substr(2, 8).toUpperCase()
    }
  };

  const { error: driverError } = await supabase
    .from('drivers')
    .upsert(driverData, { onConflict: 'user_id' });

  if (driverError) {
    console.error(`❌ Error creando conductor para ${displayName}:`, driverError);
  } else {
    console.log(`✅ Conductor creado para: ${displayName}`);
    console.log(`   - Vehículo: ${driverData.car_info.model} ${driverData.car_info.year}`);
    console.log(`   - Placa: ${driverData.car_info.plate}`);
    console.log(`   - Calificación: ${driverData.rating.toFixed(1)}`);
  }
}

migrateKnownUsers(); 