const fs = require('fs');
const path = require('path');

console.log('🔧 Arreglando archivo de expo-router...');

const expoRouterFile = path.resolve(__dirname, 'node_modules/expo-router/_ctx.web.js');
const backupFile = path.resolve(__dirname, 'node_modules/expo-router/_ctx.web.js.backup');

// Crear backup si no existe
if (!fs.existsSync(backupFile)) {
  fs.copyFileSync(expoRouterFile, backupFile);
  console.log('✅ Backup creado');
}

// Contenido corregido
const fixedContent = `const path = require('path');

// Definir la ruta del directorio app de manera absoluta
const appRoot = path.resolve(__dirname, '../../../app');

export const ctx = require.context(
  appRoot,
  true,
  /^(?:\\.\\/)(?!(?:(?:(?:.*\\+api)|(?:\\+(html|native-intent))))\\.[tj]sx?$).*(?:\\.android|\\.ios|\\.native)?\\.[tj]sx?$/,
  process.env.EXPO_ROUTER_IMPORT_MODE
);
`;

// Escribir el archivo corregido
fs.writeFileSync(expoRouterFile, fixedContent);
console.log('✅ Archivo de expo-router corregido');

// Verificar que el archivo se escribió correctamente
const content = fs.readFileSync(expoRouterFile, 'utf8');
console.log('📄 Contenido del archivo:');
console.log(content); 