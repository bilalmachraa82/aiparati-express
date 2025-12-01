#!/usr/bin/env python3
"""
Servidor simples para o frontend profissional AutoFund AI
"""

import http.server
import socketserver
import webbrowser
import os

PORT = 3002
DIRECTORY = "."

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        # Adicionar headers CORS para permitir requests do frontend
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        super().end_headers()

if __name__ == "__main__":
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"🚀 Servidor profissional rodando em: http://localhost:{PORT}")
        print(f"📁 Servindo arquivos de: {os.path.abspath(DIRECTORY)}")
        print(f"🌐 Acesse: http://localhost:{PORT}/index_professional.html")
        print()
        print("Backend rodando em: http://localhost:8000")
        print("Pressione Ctrl+C para parar")

        # Abrir navegador automaticamente
        webbrowser.open(f'http://localhost:{PORT}/index_professional.html')

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Servidor parado")