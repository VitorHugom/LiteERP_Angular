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
            { label: 'Relatórios', routerLink: '/clientes-relatorio' }
          ]
        },
        {
          label: 'Fornecedores',
          icone: 'images/icone-arrow.png',
          subItems: [
            { label: 'Cadastro', routerLink: '/fornecedores-busca' },
            { label: 'Relatórios', routerLink: '/fornecedores-relatorio' }
          ]
        },
        {
          label: 'Produtos',
          icone: 'images/icone-arrow.png',
          subItems: [
            { label: 'Cadastro', routerLink: '/busca-produtos' },
            { label: 'Grupo de Produtos', routerLink: '/grupo-produtos-busca' },
            {
              label: 'Relatórios',
              routerLink: '/produtos-relatorio'
            }
          ]
        },
        {
          label: 'Básico',
          icone: 'images/icone-arrow.png',
          subItems: [
            { label: 'Formas de Pagamento', routerLink: '/forma-pagamento-busca'}
          ]
        }
      ]
    },
    {
      image:'images/icone-vendas.png',
      icone: 'images/icone-arrow.png',
      label: 'Vendas',
      subItems: [
        { label: 'Pedidos de Venda', routerLink: '/pedidos-busca' },
        { label: 'Relatório de Venda', routerLink: '/pedidos-relatorio'},
      ]
    },
    {
      image:'images/icone-faturamento.png',
      icone: 'images/icone-arrow.png',
      label: 'Financeiro',
      subItems: [
        { label: 'Contas a Pagar', routerLink: '/contas-pagar-busca' },
        { label: 'Contas a Receber', routerLink: '/contas-receber-busca' },
        { label: 'Relatório de Contas a Pagar', routerLink: '/contas-pagar-relatorio' },
        { label: 'Relatório de Contas a Receber', routerLink: '/contas-receber-relatorio' }

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
        { label: 'Estoque', routerLink: '/estoque-busca' },
        { label: 'Relatório', routerLink: '/estoque-relatorio' }
      ]
    },
    {
      image:'images/icone-administrador.png',
      icone: 'images/icone-arrow.png',
      label: 'Administrador',
      subItems: [
        { label: 'Liberar Usuários', routerLink: '/busca-liberacao' },
        { label: 'Usuários', routerLink: '/usuarios-busca' },
        { label: 'Relatório', routerLink: '/usuario-relatorio' }
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
