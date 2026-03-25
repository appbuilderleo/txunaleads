# 🐳 DOCKERFILE RAIZ (txunaleads) para o Render.com
# Use a imagem oficial do Playwright v1.58.2 (para coincidir com o package.json)
FROM mcr.microsoft.com/playwright:v1.58.2-noble

# Definir diretório de trabalho
WORKDIR /app

# Copiar ficheiros de dependência para o contexto da build
# Nota: Como o Dockerfile está na raiz, apontamos para a pasta backend/
COPY backend/package*.json ./

# Instalar dependências e garantir que o Chromium de sistema está instalado
RUN npm install && npx playwright install chromium --with-deps

# Copiar o restante do código da pasta backend para o contentor
COPY backend/ .

# Expor a porta 4000 (ajustada para seu backend)
EXPOSE 4000
ENV PORT=4000

# Iniciar o servidor
CMD ["npm", "start"]
