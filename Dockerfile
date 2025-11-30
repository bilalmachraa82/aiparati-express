FROM node:18-alpine AS base

# Instalar dependências de build
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copiar package files
COPY package.json package-lock.json* ./

# Instalar dependências
RUN npm ci

# Build stage
FROM base AS builder
COPY --from=base /app/node_modules ./node_modules
COPY . .

# Construir aplicação
RUN npm run build

# Production stage
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Criar usuário non-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar build
COPY --from=builder /app/public ./public

# Automaticamente aproveita output de tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Iniciar aplicação
CMD ["node", "server.js"]