FROM node:22-alpine
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

EXPOSE 9000

CMD ["sh", "-c", "node_modules/.bin/medusa db:migrate && node_modules/.bin/medusa start"]
