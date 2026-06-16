# Multi-stage build: build client, then build minimal server image

# Build client
FROM node:18-alpine AS client-build
WORKDIR /app
COPY client/package*.json ./client/
RUN cd client && npm ci --silent
COPY client ./client
RUN cd client && npm run build

# Final image
FROM node:18-alpine
WORKDIR /app

# Install server deps
COPY server/package*.json ./server/
RUN cd server && npm ci --production --silent

# Copy server code
COPY server ./server
# Copy built client into /app/build so server can serve static files
COPY --from=client-build /app/client/build /app/build

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "server/index.js"]
