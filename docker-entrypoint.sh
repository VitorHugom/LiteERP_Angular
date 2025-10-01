#!/bin/sh

# Script para substituir variáveis de ambiente nos arquivos JavaScript do Angular
# Este script é executado quando o container Docker inicia

# A variável API_URL deve vir do ambiente do container
# Se não estiver definida, usa o valor padrão do Dockerfile
if [ -z "$API_URL" ]; then
    echo "AVISO: API_URL não definida, usando valor padrão"
fi

echo "Configurando variáveis de ambiente..."
echo "API_URL: $API_URL"

# Verifica se existem arquivos JS para substituir
echo "Procurando arquivos JavaScript..."
find /usr/share/nginx/html -name "*.js" | head -5

# Encontra todos os arquivos JavaScript no diretório do nginx e substitui qualquer URL da API pela variável de ambiente
echo "Substituindo URLs da API por $API_URL nos arquivos JavaScript..."
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|http://localhost:8080|$API_URL|g" {} \;
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|https://api\.seu-dominio\.com|$API_URL|g" {} \;
find /usr/share/nginx/html -name "*.js" -exec sed -i "s|https://api\.lite-erp-enterprise\.com|$API_URL|g" {} \;

# Verifica se a substituição foi feita
echo "Verificando substituição..."
echo "Procurando por URLs antigas nos arquivos JS:"
find /usr/share/nginx/html -name "*.js" -exec grep -l "localhost:8080\|seu-dominio\.com" {} \; | head -3
echo "Procurando pela nova URL ($API_URL) nos arquivos JS:"
find /usr/share/nginx/html -name "*.js" -exec grep -l "$API_URL" {} \; | head -3

echo "Substituição de variáveis concluída."

# Inicia o nginx
exec "$@"
