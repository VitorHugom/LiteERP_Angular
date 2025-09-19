/**
 * Utilitários para navegação baseada em roles de usuário
 */

/**
 * Determina a rota home baseada no role do usuário armazenado no sessionStorage
 * @returns string - A rota para a tela home correspondente ao role do usuário
 */
export function getHomeRouteByUserRole(): string {
  const role = sessionStorage.getItem('user-role');
  
  switch (role) {
    case 'ROLE_GERENCIAL':
      return '/gerencial';
    case 'ROLE_VENDAS':
      return '/vendas';
    case 'ROLE_CAIXA':
      return '/caixa';
    default:
      return '/gerencial'; // Fallback padrão
  }
}

/**
 * Verifica se o usuário tem um role válido
 * @returns boolean - true se o role é válido, false caso contrário
 */
export function hasValidUserRole(): boolean {
  const role = sessionStorage.getItem('user-role');
  return ['ROLE_GERENCIAL', 'ROLE_VENDAS', 'ROLE_CAIXA'].includes(role || '');
}
