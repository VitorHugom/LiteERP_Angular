import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-venda',
  standalone: true,
  imports: [],
  templateUrl: './vendas.component.html',
  styleUrl: './vendas.component.scss'
})
export class VendaComponent {

  constructor(private router: Router) { }

  sair(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  novoPedido(): void {
    this.router.navigate(['/novo-pedido-vendas']);
  }

  abrirPedidos(): void {
    this.router.navigate(['/pedidos-busca']);
  }

  abrirOrcamentos(): void {
    this.router.navigate(['/orcamentos']);
  }

  abrirClientes(): void {
    this.router.navigate(['clientes-busca']);
  }
}
