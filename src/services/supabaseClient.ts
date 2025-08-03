import { createClient } from '@supabase/supabase-js';

// Reemplaza estos valores con los de tu proyecto Supabase
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Verificar que las variables estén configuradas
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('⚠️ Variables de Supabase no configuradas:', {
    SUPABASE_URL: SUPABASE_URL ? 'Configurada' : 'No configurada',
    SUPABASE_ANON_KEY: SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada'
  });
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Función de prueba de conexión
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.error('❌ Error de conexión a Supabase:', error.message);
      return false;
    }
    console.log('✅ Conexión a Supabase exitosa. Ejemplo de datos:', data);
    return true;
  } catch (err) {
    console.error('❌ Error inesperado al probar Supabase:', err);
    return false;
  }
} 