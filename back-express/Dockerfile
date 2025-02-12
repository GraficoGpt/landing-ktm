# Etapa base
FROM node:18-slim AS base
WORKDIR /app

# Instalar dependencias necesarias para la compilación
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Mostrar contenido del package.json para diagnóstico
RUN cat package.json

# Instalar dependencias con log detallado
RUN npm install --production --verbose

# Copiar el resto de archivos
COPY . .

# Variables de entorno y puerto
ENV PORT=3000
ENV NODE_ENV=production
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["npm", "start"]