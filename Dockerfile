FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
