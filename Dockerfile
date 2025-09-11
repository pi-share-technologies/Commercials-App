# Basic Dockerfile for local React development with Vite
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Expose development port
EXPOSE 3000

# Add healthcheck to monitor app status
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000 || exit 1

# Install curl for healthcheck
RUN apk add --no-cache curl

# Start development server
CMD ["npm", "start"]
