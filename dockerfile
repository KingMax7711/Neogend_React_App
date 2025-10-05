# Étape 1 : Build de l'app avec Vite
FROM node:18 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Étape 2 : Serveur statique Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Copie du fichier de config Nginx (qu'on fera juste après)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
