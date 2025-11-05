#!/bin/sh

set -e

echo "Aguardando banco de dados estar disponível..."

# Aguarda o PostgreSQL estar pronto usando nc (netcat)
if command -v nc >/dev/null 2>&1; then
  until nc -z ${DB_HOST:-postgres} ${DB_PORT:-5432} 2>/dev/null; do
    echo "Aguardando PostgreSQL em ${DB_HOST:-postgres}:${DB_PORT:-5432}..."
    sleep 2
  done
else
  # Se nc não estiver disponível, aguarda um tempo fixo
  echo "nc não disponível, aguardando 10 segundos..."
  sleep 10
fi

echo "Banco de dados está disponível!"

# Executa os seeders apenas se a variável RUN_SEEDERS estiver definida
if [ "$RUN_SEEDERS" = "true" ]; then
  echo "Executando seeders..."
  # Tenta usar o código compilado primeiro, depois fallback para ts-node
  if [ -f "dist/database/run-seeders.js" ]; then
    echo "Usando código compilado..."
    NODE_ENV=production npm run seed:prod 2>&1 || echo "Aviso: Seeders falharam ou já foram executados"
  else
    echo "Usando ts-node (pode levar alguns segundos para carregar)..."
    echo "Aguarde, isso pode demorar na primeira execução..."
    NODE_ENV=development npm run seed 2>&1 || echo "Aviso: Seeders falharam ou já foram executados"
  fi
  echo "Seeders finalizados."
else
  echo "Seeders não serão executados (defina RUN_SEEDERS=true para executar)"
fi

# Inicia a aplicação
echo "Iniciando aplicação..."
exec "$@"

