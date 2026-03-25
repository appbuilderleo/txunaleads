# Usar imagem oficial do Playwright que corresponda à versão instalada no package.json
FROM mcr.microsoft.com/playwright:v1.58.2-noble

# Definir o diretório de trabalho
WORKDIR /app

# Copiar os ficheiros de dependências
COPY package*.json ./

# Instalar dependências (incluindo tsx para rodar o backend em TS)
RUN npm install && npx playwright install chromium --with-deps

# Copiar o restante do código
COPY . .

# Expor a porta configurada
EXPOSE 4000

# Variável de ambiente padrão para a porta
ENV PORT=4000

# Executar o comando start que criamos no package.json
CMD ["npm", "start"]
