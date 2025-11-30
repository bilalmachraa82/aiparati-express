#!/bin/bash

echo "🚀 Deploy Backend no Railway"

# Instalar Railway CLI
npm install -g @railway/cli

# Login no Railway
railway login

# Criar novo projeto
railway new --name aiparati-backend

# Configurar variáveis de ambiente
railway variables set ANTHROPIC_API_KEY=$ANTHROPIC_API_KEY
railway variables set CORS_ORIGINS="https://fundos.aiparati.pt,https://aiparati-express.vercel.app"
railway variables set MODEL_EXTRACTION=claude-3-5-sonnet-20241022
railway variables set MODEL_ANALYSIS=claude-opus-4-5-20251101

# Fazer deploy
railway up

# Obter URL da API
echo "📍 URL da API:"
railway domain