#!/bin/bash

echo "🐳 Iniciando AiparatiExpress com Docker..."

# Verificar se .env existe
if [ ! -f .env ]; then
    echo "❌ Erro: Arquivo .env não encontrado!"
    echo "Copie .env.example para .env e configure sua ANTHROPIC_API_KEY"
    exit 1
fi

# Parar containers anteriores
echo "🛑 Parando containers anteriores..."
docker-compose -f docker-compose.simple.yml down -v

# Construir e iniciar containers
echo "🔨 Construindo imagens..."
docker-compose -f docker-compose.simple.yml build

echo "🚀 Iniciando aplicação..."
docker-compose -f docker-compose.simple.yml up

# Para rodar em background:
# docker-compose -f docker-compose.simple.yml up -d

echo ""
echo "✅ Aplicações iniciadas!"
echo "📍 Frontend: http://localhost:3000"
echo "📍 Backend API: http://localhost:8000"
echo "📍 API Docs: http://localhost:8000/docs"
echo ""
echo "Para ver logs: docker-compose -f docker-compose.simple.yml logs -f"
echo "Para parar: docker-compose -f docker-compose.simple.yml down"