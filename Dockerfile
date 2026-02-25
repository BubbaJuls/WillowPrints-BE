# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (including dev for build)
RUN npm ci

# Generate Prisma client
RUN npx prisma generate

COPY . .

# Build the app
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy package files and install prod deps only
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# Copy built app from builder
COPY --from=builder /app/dist ./dist

EXPOSE 4000

# Run migrations then start (override CMD for dev without migrate)
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main.js"]
