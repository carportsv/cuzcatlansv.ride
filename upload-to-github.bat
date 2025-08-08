@echo off
echo 🚀 Configurando repositorio para GitHub Pages...

echo 📋 Configurando remoto...
git remote set-url origin https://github.com/carportsv/cuzcatlansv.ride.git

echo 🔐 Agregando todos los archivos...
git add .

echo 📝 Haciendo commit inicial...
git commit -m "🚀 Versión inicial para GitHub Pages - Sistema de secrets con placeholders"

echo 🚀 Subiendo a GitHub...
git push -u origin main

echo ✅ ¡Repositorio subido exitosamente!
echo.
echo 📋 Próximos pasos:
echo 1. Configurar GitHub Secrets en: https://github.com/carportsv/cuzcatlansv.ride/settings/secrets/actions
echo 2. Configurar GitHub Pages en: https://github.com/carportsv/cuzcatlansv.ride/settings/pages
echo.
pause
