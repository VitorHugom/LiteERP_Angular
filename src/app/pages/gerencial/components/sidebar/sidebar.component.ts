import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface MenuItem {
  image?:string;
  icone?: string
  label: string;
  routerLink?: string;
  subItems?: MenuItem[];
}


@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  isSidebarCollapsed = true;
  activeMenus: { [key: string]: boolean } = {}; // Controla menus expandidos

  // Definindo a estrutura dos menus e submenus
  menuItems: MenuItem[] = [
    {

      image:'images/icone-cadastro.png',
      icone: 'images/icone-arrow.png',
      label: 'Cadastros',
      subItems: [
        { label: 'Clientes',
          icone: 'images/icone-arrow.png',
          subItems: [
            { label: 'Cadastro', routerLink: '/clientes-busca' },
            { label: 'Relatórios', routerLink: '/relatorio-clientes' }
          ]
        },
        { label: 'Fornecedores', routerLink: '/fornecedores-busca' },
        {
          label: 'Produtos',
          icone: 'images/icone-arrow.png',
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
      image:'images/icone-vendas.png',
      icone: 'images/icone-arrow.png',
      label: 'Vendas',
      subItems: [
        { label: 'Pedidos de Venda', routerLink: '/pedidos-busca' }
      ]
    },
    {
      image:'images/icone-faturamento.png',
      icone: 'images/icone-arrow.png',
      label: 'Faturamento',
      subItems: [
        { label: 'Emissão de NFe', routerLink: '/emissao-nfe' },
        { label: 'Envio de NFe', routerLink: '/envio-nfe' }
      ]
    },
    {
      image:'images/icone-compra.png',
      icone: 'images/icone-arrow.png',
      label: 'Compras',
      subItems: [
        { label: 'Recebimento de Mercadorias', routerLink: '/recebimento-mercadorias-busca' }
      ]
    },
    {
      image:'images/icone-estoque.png',
      icone: 'images/icone-arrow.png',
      label: 'Estoque',
      subItems: [
        { label: 'Movimento de Estoque', routerLink: '/movimento-estoque-busca' },
        { label: 'Estoque', routerLink: '/estoque-busca' }
      ]
    },
    {
      image:'images/icone-administrador.png',
      icone: 'images/icone-arrow.png',
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

  openSideBar(){
    this.isSidebarCollapsed = false
  }


  // Função para controlar os menus abertos/fechados
  toggleMenu(menuLabel: string, isSidebarCollapsed?: boolean): void {
    if(isSidebarCollapsed){
      this.toggleSidebar()
    }
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
