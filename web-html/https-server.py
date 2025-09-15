#!/usr/bin/env python3
"""
Servidor HTTPS simple para desarrollo local
Permite que reCAPTCHA funcione correctamente
Sirve home.html como página principal
"""

import http.server
import socketserver
import ssl
import os
import sys
from pathlib import Path

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def guess_type(self, path):
        """Determinar el tipo MIME del archivo"""
        mimetype = super().guess_type(path)
        if path.endswith('.json'):
            return 'application/json'
        return mimetype
    
    def do_GET(self):
        # Redirecciones para mantener compatibilidad
        if self.path == '/home.html':
            self.send_response(302)
            self.send_header('Location', '/home/home.html')
            self.end_headers()
            return
        elif self.path == '/login.html':
            self.send_response(302)
            self.send_header('Location', '/auth/login.html')
            self.end_headers()
            return
        
        # Solo permitir archivos y recursos necesarios
        allowed_files = [
            '/',
            '/index.html',
            '/auth/login.html',
            '/home/home.html',
            '/test-auth.html',
            '/config.env.json',
            '/css/style.css',
            '/css/components.css',
            '/css/responsive.css',
            '/js/config.js',
            '/js/shared-utils.js',
            '/js/maps.js',
            '/js/auth.js',
            '/js/app.js',
            '/js/api.js',
            '/js/admin.js',
            '/js/ride-edit-service.js',
            '/ride-management/create/',
            '/ride-management/create/create-ride.html',
            '/ride-management/create/create-ride.css',
            '/ride-management/create/create-ride.js',
            '/drivers/',
            '/drivers/drivers.html',
            '/drivers/drivers.css',
            '/drivers/drivers.js',
            '/ride-management/',
            '/ride-management/ride-management.html',
            '/ride-management/ride-management.css',
            '/ride-management/ride-management.js',
            '/ride-management/pending/',
            '/ride-management/pending/pending-rides.html',
            '/ride-management/pending/pending-rides.js',
            '/ride-management/pending/pending-rides.css',
            '/ride-management/accepted/',
            '/ride-management/accepted/accepted-rides.html',
            '/ride-management/accepted/accepted-rides.js',
            '/ride-management/accepted/accepted-rides.css',
            '/ride-management/in-progress/',
            '/ride-management/in-progress/in-progress-rides.html',
            '/ride-management/in-progress/in-progress-rides.js',
            '/ride-management/in-progress/in-progress-rides.css',
            '/ride-management/completed/',
            '/ride-management/completed/completed-rides.html',
            '/ride-management/completed/completed-rides.js',
            '/ride-management/completed/completed-rides.css',
            '/ride-management/cancelled/',
            '/ride-management/cancelled/cancelled-rides.html',
            '/ride-management/cancelled/cancelled-rides.js',
            '/ride-management/cancelled/cancelled-rides.css',
            '/reports/',
            '/reports/reports.html',
            '/reports/reports.css',
            '/reports/reports.js',
            '/configuration/',
            '/configuration/configuration.html',
            '/configuration/configuration.css',
            '/configuration/configuration.js'
        ]
        
        # Si se accede a la raíz (/), servir login.html
        if self.path == '/':
            self.path = '/login.html'
        # Si se accede a /index, redirigir a login.html
        elif self.path == '/index' or self.path == '/index.html':
            self.send_response(302)
            self.send_header('Location', '/login.html')
            self.end_headers()
            return
        # Verificar autenticación para páginas protegidas
        elif self.path == '/home.html' or self.path.startswith('/drivers/') or self.path.startswith('/ride-management/') or self.path.startswith('/reports/') or self.path.startswith('/configuration/') or self.path.startswith('/create-ride/'):
            # Verificar si hay una cookie de sesión válida
            if not self.is_authenticated():
                self.send_response(302)
                self.send_header('Location', '/login.html')
                self.end_headers()
                return
            # Si está autenticado, permitir acceso
            pass
        # Si se accede a cualquier archivo no permitido, redirigir a login.html
        elif not any(self.path.startswith(allowed) for allowed in allowed_files):
            self.send_response(302)
            self.send_header('Location', '/login.html')
            self.end_headers()
            return
        
        # Continuar con el comportamiento normal solo para archivos permitidos
        super().do_GET()

    def is_authenticated(self):
        """Verificar si el usuario está autenticado basándose en las cookies"""
        try:
            # Obtener la cookie de autenticación
            auth_cookie = None
            if 'Cookie' in self.headers:
                cookies = self.headers['Cookie']
                for cookie in cookies.split(';'):
                    if 'auth_token=' in cookie:
                        auth_cookie = cookie.split('=')[1].strip()
                        break
            
            # Si no hay cookie de autenticación, no está autenticado
            if not auth_cookie:
                return False
            
            # Aquí podrías verificar la validez del token con Firebase/Supabase
            # Por ahora, solo verificamos que exista
            # En producción, deberías verificar la firma del token
            return True
            
        except Exception as e:
            print(f"❌ Error verificando autenticación: {e}")
            return False

def create_self_signed_cert():
    """Crear certificado SSL autofirmado para desarrollo"""
    cert_file = "localhost.crt"
    key_file = "localhost.key"
    
    if not os.path.exists(cert_file) or not os.path.exists(key_file):
        print("🔐 Generando certificado SSL autofirmado...")
        
        # Comando para generar certificado SSL
        cmd = f'openssl req -x509 -newkey rsa:4096 -keyout {key_file} -out {cert_file} -days 365 -nodes -subj "/C=SV/ST=San Salvador/L=San Salvador/O=Development/CN=localhost"'
        
        try:
            os.system(cmd)
            print("✅ Certificado SSL generado")
        except Exception as e:
            print(f"❌ Error generando certificado: {e}")
            return False
    
    return True

def main():
    PORT = 8443
    
    # Cambiar al directorio del script
    script_dir = Path(__file__).parent
    os.chdir(script_dir)
    
    # Crear certificado SSL
    if not create_self_signed_cert():
        print("❌ No se pudo crear el certificado SSL")
        sys.exit(1)
    
    # Configurar servidor HTTP con handler personalizado
    Handler = CustomHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            # Configurar SSL
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.load_cert_chain('localhost.crt', 'localhost.key')
            httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
            
            print(f"🚀 Servidor HTTPS ejecutándose en https://localhost:{PORT}")
            print(f"📁 Sirviendo archivos desde: {os.getcwd()}")
            print(f"🏠 Página principal: login.html")
            print("🔐 Certificado SSL autofirmado - el navegador mostrará una advertencia")
            print("💡 Para continuar, haz clic en 'Avanzado' y luego 'Continuar'")
            print("🛑 Presiona Ctrl+C para detener el servidor")
            
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n🛑 Servidor detenido")
    except Exception as e:
        print(f"❌ Error iniciando servidor: {e}")

if __name__ == "__main__":
    main() 