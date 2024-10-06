import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-vendas-home',
  standalone: true,
  templateUrl: './vendas-home.component.html',
  styleUrls: ['./vendas-home.component.scss'],
  imports: [CommonModule],
})
export class VendasHomeComponent {

  constructor(private router: Router) { }

  sair(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  novoPedido(): void {
    this.router.navigate(['/novo-pedido-vendas']);
  }

  abrirPedidos(): void {
    this.router.navigate(['/novo-pedido-vendas']);
  }

  abrirOrcamentos(): void {
    this.router.navigate(['/orcamentos']);
  }

  abrirClientes(): void {
    this.router.navigate(['/clientes']);
  }
}
