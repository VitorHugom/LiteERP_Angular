import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
  
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('auth-token');
      const role = sessionStorage.getItem('user-role');
      // console.log('Token:', token);
  
      if (!token || !role) {
        this.router.navigate(['/login']);
        return false;
      }
  
      const expectedRoles = route.data['expectedRoles'] as Array<string>;
  
      if (expectedRoles && expectedRoles.includes(role)) {
        return true;
      }
  
      this.router.navigate(['/acesso-negado']);
      return false;
    }
  
    // Se não estiver no contexto do navegador, impede a navegação
    return false;
  }
}
