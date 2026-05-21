# --- STAGE 1: Build ---
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package configuration files
COPY package*.json ./

# Install all dependencies (including devDependencies for building TypeScript)
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the NestJS application (generates the /dist folder)
RUN npm run build

# Remove development dependencies to keep the production image clean
RUN npm prune --production

# --- STAGE 2: Production Run ---
FROM node:20-alpine AS runner

WORKDIR /usr/src/app

# Copy only the necessary production pieces from the builder stage
COPY --from=builder /usr/src/app/package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Expose the port your NestJS app runs on (default is usually 3000)
EXPOSE 3000

# Start the NestJS server
CMD ["node", "dist/main.js"]
