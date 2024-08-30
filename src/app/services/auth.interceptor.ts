import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  console.log(`Interceptando a requisição para a URL: ${req.url}`);

  if (req.url.includes('/auth')) {
    console.log('Exceção de URL, não adicionando o cabeçalho de autenticação.');
    return next(req);
  }

  const authToken = sessionStorage.getItem('auth-token');
  console.log('Token no interceptor:', authToken);

  if (authToken) {
    const clonedRequest = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`),
    });
    console.log('Requisição clonada com cabeçalho de autorização:', clonedRequest);
    return next(clonedRequest);
  } else {
    console.log('Nenhum token encontrado, seguindo sem modificar a requisição.');
    return next(req);
  }
};
