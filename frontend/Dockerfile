# Сборка фронта
FROM node:alpine AS build

WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

COPY . .

RUN chmod +x node_modules/.bin/vite
RUN npm run build

# Сервинг собранного фронта через nginx
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
