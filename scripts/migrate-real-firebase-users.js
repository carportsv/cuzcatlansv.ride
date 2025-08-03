const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Variables de entorno de Supabase no encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Usuarios reales de Firebase que ya están en Supabase
const realFirebaseUsers = [
  {
    uid: 'yeEovAIpw9MWchXYrUErJFTbgyV2',
    email: 'veramy1982@gmail.com',
    displayName: 'Veronica Alfaro',
    phoneNumber: '',
    role: 'driver' // Convertir a conductor
  },
  {
    uid: 'PO50dbcOFVTJoiA7MouHlnTEGAV2',
    email: 'fred.wicket.us@gmail.com',
    displayName: 'Fred Wicket',
    phoneNumber: '',
    role: 'driver' // Convertir a conductor
  }
];

async function migrateRealFirebaseUsers() {
  console.log('🔍 Migrando usuarios reales de Firebase a conductores...');

  try {
    for (const firebaseUser of realFirebaseUsers) {
      console.log(`\n👤 Procesando usuario real: ${firebaseUser.displayName}`);
      console.log(`   Firebase UID: ${firebaseUser.uid}`);
      console.log(`   Email: ${firebaseUser.email}`);
      console.log(`   Rol: ${firebaseUser.role}`);
      
      // Verificar si existe en Supabase
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
      console.log(`✅ Usuario encontrado: ${user.display_name} (rol actual: ${user.role})`);
      
      // Actualizar rol si es necesario
      if (user.role !== firebaseUser.role) {
        console.log(`🔄 Actualizando rol de ${user.role} a ${firebaseUser.role}...`);
        
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: firebaseUser.role,
            display_name: firebaseUser.displayName
          })
          .eq('firebase_uid', firebaseUser.uid);

        if (updateError) {
          console.error(`❌ Error actualizando rol:`, updateError);
        } else {
          console.log(`✅ Rol actualizado a ${firebaseUser.role}`);
          
          // Si ahora es conductor, crear perfil de conductor
          if (firebaseUser.role === 'driver') {
            await createDriverProfile(user.id, firebaseUser.displayName);
          }
        }
      } else {
        console.log(`✅ Usuario ya tiene rol ${firebaseUser.role}`);
        
        // Verificar si ya tiene perfil de conductor
        if (firebaseUser.role === 'driver') {
          const { data: existingDriver, error: driverError } = await supabase
            .from('drivers')
            .select('*')
            .eq('user_id', user.id);

          if (driverError) {
            console.error(`❌ Error verificando conductor:`, driverError);
          } else if (!existingDriver || existingDriver.length === 0) {
            console.log(`📝 Creando perfil de conductor para: ${firebaseUser.displayName}`);
            await createDriverProfile(user.id, firebaseUser.displayName);
          } else {
            console.log(`✅ Perfil de conductor ya existe para: ${firebaseUser.displayName}`);
          }
        }
      }
    }

    console.log('\n🎉 Migración de usuarios reales completada');
    
    // Verificar usuarios finales
    const { data: finalUsers, error: finalError } = await supabase
      .from('users')
      .select('*')
      .in('firebase_uid', realFirebaseUsers.map(u => u.uid));

    if (finalError) {
      console.error('❌ Error verificando usuarios finales:', finalError);
    } else {
      console.log(`\n📊 Usuarios reales en Supabase:`);
      finalUsers?.forEach(user => {
        console.log(`  - ${user.display_name} (${user.role}) - ${user.firebase_uid}`);
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

migrateRealFirebaseUsers(); 