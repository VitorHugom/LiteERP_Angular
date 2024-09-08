import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  label: string;
  routerLink?: string;
  subItems?: MenuItem[];
}

@Component({
  selector: 'app-gerencial-home',
  standalone: true,
  templateUrl: './gerencial-home.component.html',
  styleUrls: ['./gerencial-home.component.scss'],
  imports: [CommonModule, RouterModule]
})
export class GerencialHomeComponent {
  isSidebarCollapsed = false;
  activeMenus: { [key: string]: boolean } = {}; // Controla menus expandidos

  // Definindo a estrutura dos menus e submenus
  menuItems: MenuItem[] = [
    {
      label: 'Cadastros',
      subItems: [
        { label: 'Clientes', routerLink: '/clientes' },
        { label: 'Fornecedores', routerLink: '/fornecedores' },
        {
          label: 'Produtos',
          subItems: [
            { label: 'Cadastro', routerLink: '/busca-produtos' },
            { label: 'Grupo de Produtos', routerLink: '/grupo-produtos-busca' },
            {
              label: 'Relatórios',
              subItems: [
                { label: 'Relatório por Compra', routerLink: '/relatorio-compra' },
                { label: 'Relatório por Venda', routerLink: '/relatorio-venda' },
                { label: 'Relatório por Grupo de Produtos', routerLink: '/relatorio-grupo-produto' }
              ]
            }
          ]
        }
      ]
    },
    {
      label: 'Vendas',
      subItems: [
        { label: 'PDV', routerLink: '/pdv' }
      ]
    },
    {
      label: 'Faturamento',
      subItems: [
        { label: 'Emissão de NFe', routerLink: '/emissao-nfe' },
        { label: 'Envio de NFe', routerLink: '/envio-nfe' }
      ]
    },
    {
      label: 'Compras',
      subItems: [
        { label: 'Recebimento de Mercadorias', routerLink: '/recebimento-mercadorias' }
      ]
    },
    {
      label: 'Administrador',
      subItems: [
        { label: 'Alterar Senha', routerLink: '/alterar-senha' },
        { label: 'Liberar Usuários', routerLink: '/busca-liberacao' }
      ]
    }
  ];

  constructor(private router: Router) {}

  // Toggle da sidebar
  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    if (this.isSidebarCollapsed) {
      this.activeMenus = {}; // Fecha todos os menus ao recolher a sidebar
    }
  }

  // Função para controlar os menus abertos/fechados
  toggleMenu(menuLabel: string): void {
    this.activeMenus[menuLabel] = !this.activeMenus[menuLabel];
  }

  // Função para verificar se o menu está expandido
  isMenuExpanded(menuLabel: string): boolean {
    return !!this.activeMenus[menuLabel];
  }

  // Logout
  logout(): void {
    sessionStorage.clear(); // Limpa o sessionStorage
    this.router.navigate(['/login']); // Redireciona para a página de login
  }
}
