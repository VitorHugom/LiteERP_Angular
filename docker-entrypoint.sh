#!/bin/sh

# Script para substituir variáveis de ambiente nos arquivos JavaScript do Angular
# Este script é executado quando o container Docker inicia

# Define valores padrão se as variáveis de ambiente não estiverem definidas
API_URL=${API_URL:-"http://localhost:8080"}

echo "Configurando variáveis de ambiente..."
echo "API_URL: $API_URL"

# Encontra todos os arquivos JavaScript no diretório do nginx e substitui a URL local pela variável de ambiente
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:8080|$API_URL|g" {} \;

echo "Substituição de variáveis concluída."

# Inicia o nginx
exec "$@"
