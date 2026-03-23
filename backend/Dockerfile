FROM oven/bun:1-alpine

# Instala netcat-openbsd para verificação de conectividade
RUN apk add --no-cache netcat-openbsd

WORKDIR /app

COPY package.json bun.lock* ./

RUN bun install --frozen-lockfile

COPY . .

RUN bun run build

# Copia e torna o entrypoint executável
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["bun", "run", "dist/main.js"]
