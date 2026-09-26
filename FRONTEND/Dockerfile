# ==========================================
# Stage 1: Build the React Application
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency definitions
COPY package.json package-lock.json* ./

# Install dependencies cleanly
RUN npm ci

# Build argument for API URL (defaults to empty string so /chat goes through Nginx proxy)
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

# Copy frontend source files
COPY . .

# Build production bundle to /app/dist
RUN npm run build

# ==========================================
# Stage 2: Production Nginx Server
# ==========================================
FROM nginx:1.27-alpine AS runner

# Remove default static files
RUN rm -rf /usr/share/nginx/html/*

# Copy built frontend assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:80/ || exit 1

# Start Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
