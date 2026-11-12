# ==============================================================
# Production Dockerfile for Node.js Express & Socket.IO Backend
# ==============================================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency definitions
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev && npm cache clean --force

# Copy backend source code
COPY server/ ./server/

# Set file permissions for the unprivileged node user
RUN chown -R node:node /app

# Switch to non-root user for security
USER node

# Production environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose backend REST & WebSocket port
EXPOSE 5000

# Start server entrypoint
CMD ["node", "server/index.js"]
