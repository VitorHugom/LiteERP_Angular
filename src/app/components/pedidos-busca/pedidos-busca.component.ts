import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-busca-pedidos',
  standalone: true,
  templateUrl: './pedidos-busca.component.html',
  styleUrls: ['./pedidos-busca.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule],
  providers: [PedidosService]
})
export class PedidosBuscaComponent implements OnInit {
  pedidos: any[] = [];
  filteredPedidos: any[] = [];
  searchQuery: string = '';
  searchBy: string = 'id';

  constructor(private pedidosService: PedidosService, private router: Router) {}

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.pedidosService.getPedidos().subscribe({
      next: (data) => {
        this.pedidos = data;
        this.filteredPedidos = data;
      },
      error: (err) => {
        console.error('Erro ao carregar pedidos:', err);
      }
    });
  }

  searchPedidos(): void {
    const query = this.searchQuery.toLowerCase();
    if (this.searchBy === 'id') {
      this.filteredPedidos = this.pedidos.filter(pedido => pedido.id.toString().includes(query));
    } else if (this.searchBy === 'cliente') {
      this.filteredPedidos = this.pedidos.filter(pedido => pedido.cliente.razaoSocial.toLowerCase().includes(query));
    } else if (this.searchBy === 'vendedor') {
      this.filteredPedidos = this.pedidos.filter(pedido => pedido.vendedor?.nome.toLowerCase().includes(query));
    }
  }

  viewPedido(id: string): void {
    this.router.navigate(['/pedidos-cadastro', id]);
  }

  navigateToHome(): void {
    this.router.navigate(['/gerencial-home']);
  }

  createNovoPedido(): void {
    this.router.navigate(['/pedidos/novo']);
  }
}
