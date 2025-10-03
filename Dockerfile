# 1. Build Stage
FROM node:18-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# 2. Serve Stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

RUN rm -rf ./*
COPY --from=build /app/build .

COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 7005
CMD ["nginx", "-g", "daemon off;"]
