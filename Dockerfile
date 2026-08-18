FROM node:22-slim@sha256:0c2b9f7b0c7c5c9c5c9c5c9c5c9c5c9c5c9c5c9c5c9c5c9c5c9c5c9c5c9c5

WORKDIR /app

COPY package*.json ./
RUN npm install --no-save && npm cache clean --force

COPY . .
RUN npm run build

EXPOSE 3000

ENV NODE_ENV=production

RUN groupadd -r appgroup && useradd -r -g appgroup appuser && \
    chown -R appuser:appgroup /app
USER appuser

CMD ["vite", "preview", "--host", "0.0.0.0", "--port", "3000"]
