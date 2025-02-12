# Etapa base con Node.js LTS
FROM node:lts AS base
WORKDIR /app
COPY package*.json ./

# Instalación de dependencias de producción
FROM base AS prod-deps
RUN npm install --only=production

# Instalación completa de dependencias para construir la aplicación
FROM base AS build-deps
RUN npm install
COPY . .

# Construcción de la aplicación Astro
FROM build-deps AS build
RUN npm run build

# Imagen final para producción
FROM node:lts-slim AS runtime
WORKDIR /app
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# Variables de entorno
ENV HOST=0.0.0.0
ENV PORT=4321

# Exposición del puerto y ejecución del servidor Astro
EXPOSE 4321
CMD ["node", "./dist/server/entry.mjs"]
