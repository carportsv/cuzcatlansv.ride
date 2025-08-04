#!/usr/bin/env python3
"""
Servidor HTTPS simple para desarrollo local
Permite que reCAPTCHA funcione correctamente
"""

import http.server
import socketserver
import ssl
import os
import sys
from pathlib import Path

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
    
    # Configurar servidor HTTP
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            # Configurar SSL
            context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
            context.load_cert_chain('localhost.crt', 'localhost.key')
            httpd.socket = context.wrap_socket(httpd.socket, server_side=True)
            
            print(f"🚀 Servidor HTTPS ejecutándose en https://localhost:{PORT}")
            print(f"📁 Sirviendo archivos desde: {os.getcwd()}")
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