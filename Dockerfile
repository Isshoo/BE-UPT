# Use Node.js LTS version
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy prisma schema
COPY prisma ./prisma

# Generate Prisma Client
RUN npx prisma generate

# Copy source code
COPY . .

# Expose ports
EXPOSE 5001
EXPOSE 5555

# Start the application
CMD ["node", "src/index.js"]