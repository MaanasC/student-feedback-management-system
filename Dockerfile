# ==============================================================
# Multi-Stage Dockerfile for React 19 Frontend + Nginx Gateway
# Stage 1: Build production static bundle with Vite
# Stage 2: Serve optimized bundle & reverse-proxy via Nginx
# ==============================================================

# ----------------- STAGE 1: BUILDER -----------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copy dependency manifests
COPY package*.json ./

# Install all dependencies (including devDependencies required for Vite build)
RUN npm ci

# Copy frontend source files and configuration
COPY . .

# Build production bundle into /app/dist
RUN npm run build

# ----------------- STAGE 2: PRODUCTION -----------------
FROM nginx:alpine

# Remove default nginx welcome page
RUN rm -rf /usr/share/nginx/html/*

# Copy built distribution from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy production Nginx reverse proxy configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose web server port
EXPOSE 80

# Health check to ensure Nginx is responding
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
