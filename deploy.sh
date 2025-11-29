#!/bin/bash

echo "🚀 Deploy AiparatiExpress - Iniciando processo..."

# Verificar se temos .env
if [ ! -f .env ]; then
    echo "❌ ERRO: Arquivo .env não encontrado!"
    echo "Copie .env.example para .env e configure suas chaves"
    exit 1
fi

# Install dependencies
echo "📦 Instalando dependências do backend..."
cd api
pip install -r requirements.txt

# Start backend
echo "🔧 Iniciando backend FastAPI..."
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait a moment
sleep 3

# Start frontend
echo "🎨 Iniciando frontend Next.js..."
cd ../aiparati-express
npm run dev &
FRONTEND_PID=$!

echo "✅ Aplicações iniciadas!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "Pressione Ctrl+C para parar"

# Wait for interrupt
trap "kill $BACKEND_PID $FRONTEND_PID" INT
wait