const fs = require('fs');
const path = require('path');

console.log('🚀 Generando script SQL para Supabase...');
console.log('');
console.log('📋 Copia y pega el siguiente código en el SQL Editor de Supabase:');
console.log('');

// Leer el archivo de esquema
const schemaPath = path.join(__dirname, '..', 'supabase-schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

console.log(schema);
console.log('');
console.log('✅ Script SQL generado. Copia y pega el código anterior en el SQL Editor de Supabase.');
console.log('');
console.log('📝 Pasos:');
console.log('1. Ve a tu proyecto de Supabase');
console.log('2. Ve a SQL Editor');
console.log('3. Pega el código anterior');
console.log('4. Haz clic en "Run"');
console.log('5. Verifica que las tablas se crearon correctamente'); 