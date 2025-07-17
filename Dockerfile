FROM docker.io/node:20-alpine

# Crear y fijar el directorio de trabajo
WORKDIR /app

# Copiar los archivos necesarios para instalar dependencias
COPY package.json yarn.lock ./

# Instalar dependencias
RUN yarn install --frozen-lockfile

# Copiar schema.prisma antes de generar Prisma Client
COPY prisma ./prisma

# Generar Prisma Client
RUN npx prisma generate

# Copiar el resto del código de la app
COPY . .

# Usar el usuario 'node' no-root
USER node

EXPOSE 3000

# Arranque del servidor Next.js accesible desde fuera del contenedor
CMD ["yarn", "dev", "--hostname", "0.0.0.0"]

