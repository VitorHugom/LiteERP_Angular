FROM node:21 as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:alpine

# Copia os arquivos buildados
COPY --from=builder /app/dist/lite-erp/browser /usr/share/nginx/html

# Copia as configurações do nginx
COPY nginx.conf /etc/nginx/nginx.conf
COPY mime.types /etc/nginx/mime.types

# Copia o script de entrypoint
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Define variáveis de ambiente padrão
ENV API_URL=https://api.lite-erp-enterprise.com

EXPOSE 80

# Usa o script de entrypoint para substituir variáveis antes de iniciar o nginx
ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
