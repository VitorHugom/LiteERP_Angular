import { HttpInterceptorFn } from '@angular/common/http';

interface HeadersMap {
  [key: string]: string | null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth')) {
    return next(req);
  }

  const authToken = sessionStorage.getItem('auth-token');
  const expiration = sessionStorage.getItem('token-expiration');
  
  if (expiration && new Date().getTime() >= +expiration) {
    // Token expirado - exiba modal e redirecione para login
    alert('Sessão expirada. Faça login novamente.');
    sessionStorage.clear();  // Limpe o token e outras informações
    window.location.href = '/login';  // Redirecione para a tela de login
    return next(req);
  }

  if (authToken) {
    const clonedRequest = req.clone({
      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });

    // Cria um objeto para armazenar os cabeçalhos da requisição clonada
    const clonedHeaders: HeadersMap = {};
    clonedRequest.headers.keys().forEach(key => {
      clonedHeaders[key] = clonedRequest.headers.get(key);
    });
    return next(clonedRequest);
  } else {
    console.log('Nenhum token encontrado, seguindo sem modificar a requisição.');
    return next(req);
  }
};
