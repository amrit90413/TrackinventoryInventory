# 1. Build Stage
FROM node:18-alpine AS build
WORKDIR /app

# Copy package files first (better cache layer)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all project files
COPY . .

# Build production-ready static files (CRA outputs to /build)
RUN npm run build

# 2. Serve Stage (Nginx)
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Remove default nginx static files
RUN rm -rf ./*

# Copy CRA build output from build stage
COPY --from=build /app/build . 

# Copy a default nginx config (to handle SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
