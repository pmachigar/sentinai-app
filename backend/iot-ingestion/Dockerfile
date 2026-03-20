FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependencias puras (aprovechamos capa de caché)
COPY package*.json ./
RUN npm ci

# Compilar Typescript a Javascript
COPY . .
RUN npm run build

# Stage 2: Imagen ligera para ejecución 
FROM node:20-alpine

WORKDIR /app

# Instalar sólo las dependencias de producción
COPY package*.json ./
RUN npm ci --only=production

# Copiar el código compilado desde stage anterior
COPY --from=builder /app/dist ./dist

CMD ["node", "dist/index.js"]
