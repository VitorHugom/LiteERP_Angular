import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors, HttpInterceptorFn } from '@angular/common/http';

// Define um tipo para representar os cabeçalhos
interface HeadersMap {
  [key: string]: string | null;
}

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/auth')) {
    return next(req);
  }

  const authToken = sessionStorage.getItem('auth-token');

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

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
  ],
};
