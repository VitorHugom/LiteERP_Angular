#!/bin/bash

# Script para verificar se a URL da API foi substituída corretamente

echo "=== Verificação da URL da API ==="
echo "URL esperada: $1"

if [ -z "$1" ]; then
    echo "Uso: $0 <URL_ESPERADA>"
    echo "Exemplo: $0 https://api.lite-erp-enterprise.com"
    exit 1
fi

EXPECTED_URL="$1"

echo "Verificando arquivos JavaScript..."

# Procura por URLs antigas
echo "1. Procurando por URLs antigas:"
OLD_URLS=$(docker exec $(docker ps -q --filter ancestor=lite-erp-frontend) find /usr/share/nginx/html -name "*.js" -exec grep -l "localhost:8080\|seu-dominio\.com" {} \;)
if [ -n "$OLD_URLS" ]; then
    echo "❌ PROBLEMA: URLs antigas encontradas:"
    echo "$OLD_URLS"
else
    echo "✅ Nenhuma URL antiga encontrada"
fi

# Procura pela URL esperada
echo "2. Procurando pela URL esperada ($EXPECTED_URL):"
NEW_URLS=$(docker exec $(docker ps -q --filter ancestor=lite-erp-frontend) find /usr/share/nginx/html -name "*.js" -exec grep -l "$EXPECTED_URL" {} \;)
if [ -n "$NEW_URLS" ]; then
    echo "✅ URL correta encontrada em:"
    echo "$NEW_URLS"
else
    echo "❌ PROBLEMA: URL esperada não encontrada"
fi

# Mostra o conteúdo real
echo "3. URLs encontradas nos arquivos:"
docker exec $(docker ps -q --filter ancestor=lite-erp-frontend) find /usr/share/nginx/html -name "*.js" -exec grep -o "https\?://[^\"']*" {} \; | grep -E "(api\.|localhost)" | sort | uniq

echo "=== Fim da verificação ==="
