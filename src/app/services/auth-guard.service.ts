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

    const token = sessionStorage.getItem('auth-token');
    const role = sessionStorage.getItem('user-role');

    // Se não há token ou role, redireciona para a página de login
    if (!token || !role) {
      this.router.navigate(['/login']);
      return false;
    }

    // Verifica as roles permitidas para a rota
    const expectedRoles = route.data['expectedRoles'] as Array<string>;

    // Verifica se o papel do usuário está na lista de papéis permitidos
    if (expectedRoles && expectedRoles.includes(role)) {
      return true;
    }

    // Redireciona o usuário se ele não tiver permissão
    this.router.navigate(['/acesso-negado']);
    return false;
  }
}
