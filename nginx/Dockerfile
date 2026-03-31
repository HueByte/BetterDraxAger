FROM node:22-alpine AS client-build
WORKDIR /client
COPY src/BetterDraxAger.Client/package*.json ./
RUN npm ci
COPY src/BetterDraxAger.Client/ ./
RUN npm run build

FROM nginx:alpine
COPY --from=client-build /client/dist /usr/share/nginx/html
COPY configuration/nginx.conf /etc/nginx/conf.d/default.conf
