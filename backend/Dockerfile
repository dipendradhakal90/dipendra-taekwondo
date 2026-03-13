FROM node:20-alpine

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

WORKDIR /app

# Copy package files
COPY package*.json ./

# Clean install production deps
RUN npm ci --only=production --no-optional && npm cache clean --force

# Copy source
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S taekwondo -u 1001

USER taekwondo

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8000/api/health || exit 1

EXPOSE 8000

ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]

