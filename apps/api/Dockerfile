# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine

WORKDIR /app

# Copy built node_modules and prisma client
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Copy application source code
COPY . .

# Expose port
EXPOSE 8081

# Start the application
CMD ["npm", "start"]
