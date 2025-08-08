@echo off
echo 🔐 Agregando archivos modificados...
git add .

echo 📝 Haciendo commit...
git commit -m "🔐 Reemplazar claves con placeholders - Claves ocultas en código fuente"

echo 🚀 Subiendo a GitHub...
git push origin main

echo ✅ ¡Cambios subidos exitosamente!
pause
