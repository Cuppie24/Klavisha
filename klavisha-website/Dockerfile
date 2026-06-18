# Stage 1: build
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# В Docker nginx проксирует запросы к medusa:9000, поэтому URL пустой
ARG VITE_MEDUSA_BACKEND_URL=""
ARG VITE_MEDUSA_PUBLISHABLE_KEY=""
ARG VITE_DEFAULT_REGION=uz

ENV VITE_MEDUSA_BACKEND_URL=$VITE_MEDUSA_BACKEND_URL
ENV VITE_MEDUSA_PUBLISHABLE_KEY=$VITE_MEDUSA_PUBLISHABLE_KEY
ENV VITE_DEFAULT_REGION=$VITE_DEFAULT_REGION

RUN npm run build

# Stage 2: serve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
