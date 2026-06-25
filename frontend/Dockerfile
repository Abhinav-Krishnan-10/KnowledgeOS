# Use standard Node alpine image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package requirements
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Expose Next.js port
EXPOSE 3000

# Run Next.js in development mode
CMD ["npm", "run", "dev"]
