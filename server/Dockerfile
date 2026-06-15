FROM node:18-alpine

WORKDIR /app

# Install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy server source
COPY . .

ENV NODE_ENV=production
EXPOSE 5000
CMD ["node", "index.js"]
