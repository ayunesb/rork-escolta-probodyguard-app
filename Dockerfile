# Use Node 20 LTS
FROM node:20-alpine

# Create and set working directory
WORKDIR /usr/src/app

# Copy package files first
COPY package*.json ./

# Install dependencies ignoring peer conflicts (React 19 compatibility)
RUN npm install --omit=dev --legacy-peer-deps

# Copy rest of the app
COPY . .

# Expose default Cloud Run port
ENV PORT=8080
EXPOSE 8080

# Run your webhook server
CMD ["node", "api/handlepaymentwebhook.js"]
