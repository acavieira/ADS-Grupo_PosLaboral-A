# Build stage
FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
#COPY packages/core/package.json packages/core/
#COPY packages/ui/package.json packages/ui/
RUN npm ci
COPY . .
RUN npm run build


# Nginx stage
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx","-g","daemon off;"]



