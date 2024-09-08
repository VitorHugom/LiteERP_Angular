import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-gerencial-home',
  standalone: true,
  templateUrl: './gerencial-home.component.html',
  styleUrls: ['./gerencial-home.component.scss'],
  imports: [CommonModule, RouterModule]
})
export class GerencialHomeComponent {
  isSidebarCollapsed = false;
  expandedMenu: string | null = null;
  expandedMenu_2: string | null = null;

  constructor(private router: Router) {}

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    if (this.isSidebarCollapsed) {
      this.expandedMenu = null; // Fecha todos os menus ao recolher a sidebar
    }
  }

  toggleMenu(menu: string): void {
    // Abre o menu apenas se a barra lateral não estiver recolhida
    if (!this.isSidebarCollapsed) {
      this.expandedMenu = this.expandedMenu === menu ? null : menu;
    }
  }

  toggleMenu_2(menu: string): void {
    // Abre o menu apenas se a barra lateral não estiver recolhida
    if (!this.isSidebarCollapsed) {
      this.expandedMenu_2 = this.expandedMenu_2 === menu ? null : menu;
    }
  }

  logout(): void {
    sessionStorage.clear(); // Limpa o sessionStorage
    this.router.navigate(['/login']); // Redireciona para a página de login
  }
}
