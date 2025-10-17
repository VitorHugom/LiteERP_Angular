import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PedidosService } from '../../services/pedidos.service';
import { Router } from '@angular/router';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';
import { PedidoBuscaDTO } from '../../models/pedido.model';
import { StatusPedidoPipe } from '../../pipes/status-pedido.pipe';
import { NomeClientePipe } from '../../pipes/nome-cliente.pipe';

@Component({
  selector: 'app-busca-pedidos',
  standalone: true,
  templateUrl: './pedidos-busca.component.html',
  styleUrls: ['./pedidos-busca.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule, NavigateToSearchButtonComponent, StatusPedidoPipe, NomeClientePipe],
  providers: [PedidosService]
})
export class PedidosBuscaComponent implements OnInit {
  pedidos: PedidoBuscaDTO[] = [];
  searchQuery: string = '';
  searchBy: string = 'id';
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;

  // Variáveis para armazenar a última consulta realizada
  lastSearchQuery: string = '';
  lastSearchBy: string = '';

  constructor(private pedidosService: PedidosService, private router: Router) {}

  ngOnInit(): void {
    this.loadPedidos();
  }

  loadPedidos(): void {
    this.pedidosService.getPedidosBusca(this.page, this.size).subscribe({
      next: (data) => {
        this.pedidos = data.content; // Array de pedidos
        this.totalPages = data.totalPages; // Total de páginas
      },
      error: (err) => {
        console.error('Erro ao carregar pedidos:', err);
      }
    });
  }

  searchPedidos(): void {
    this.page = 0; // Reinicia a paginação ao buscar

    // Armazena a consulta atual
    this.lastSearchQuery = this.searchQuery;
    this.lastSearchBy = this.searchBy;

    if (!this.searchQuery) {
      this.loadPedidos();
      return;
    }
  
    if (this.searchBy === 'id') {
      this.pedidosService.getSimplePedidoById(this.searchQuery).subscribe({
        next: (data) => {
          this.pedidos = data ? [data] : []; // Converte a resposta para um array, ou vazio se não encontrado
          this.totalPages = 1; // Define uma página já que é um único resultado
        },
        error: (err) => {
          console.error('Erro ao buscar pedido por ID:', err);
          this.pedidos = [];
        }
      });
    } else if (this.searchBy === 'cliente') {
      this.pedidosService.buscarPedidosPorRazaoSocial(this.searchQuery, this.page, this.size).subscribe({
        next: (data) => {
          this.pedidos = data.content;
          this.totalPages = data.totalPages;
        },
        error: (err) => {
          console.error('Erro ao buscar pedidos por razão social:', err);
          this.pedidos = [];
        }
      });
    }
  }
  

  navigateToHome(): void {
    const role = sessionStorage.getItem('user-role');
    if (role === 'ROLE_GERENCIAL') {
      this.router.navigate(['/gerencial']);
    } else if (role === 'ROLE_VENDAS') {
      this.router.navigate(['/vendas']);
    } else if (role === 'ROLE_CAIXA') {
      this.router.navigate(['/caixa']);
    }
  }

  viewPedido(id: number): void {
    this.router.navigate(['/pedidos-cadastro', id]);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      
      // Verifica se há uma última consulta realizada
      if (this.lastSearchQuery) {
        if (this.lastSearchBy === 'id') {
          this.pedidosService.getSimplePedidoById(this.lastSearchQuery).subscribe({
            next: (data) => {
              this.pedidos = data ? [data] : []; // Converte a resposta para um array, ou vazio se não encontrado
              this.totalPages = 1; // Define uma página já que é um único resultado
            },
            error: (err) => {
              console.error('Erro ao buscar pedido por ID:', err);
              this.pedidos = [];
            }
          });
        } else if (this.lastSearchBy === 'cliente') {
          this.pedidosService.buscarPedidosPorRazaoSocial(this.lastSearchQuery, this.page, this.size).subscribe({
            next: (data) => {
              this.pedidos = data.content;
              this.totalPages = data.totalPages;
            },
            error: (err) => {
              console.error('Erro ao buscar pedidos por razão social:', err);
              this.pedidos = [];
            }
          });
        }
      } else {
        // Se não houver uma consulta anterior, carrega todos os pedidos
        this.loadPedidos();
      }
    }
  }

  createNovoPedido(): void {
    const role = sessionStorage.getItem('user-role');
    if (role === 'ROLE_VENDAS') {
      this.router.navigate(['/novo-pedido-vendas']);
    } else {
      this.router.navigate(['/pedidos-cadastro/novo']);
    }
  }
}