export const environment = {
    production: false,
    apiUrl: 'http://localhost:8080'  // Valor para desenvolvimento local
    // No Docker, este valor será substituído por __API_URL_PLACEHOLDER__ durante o build
    // e depois pela variável de ambiente API_URL no runtime
  };
  