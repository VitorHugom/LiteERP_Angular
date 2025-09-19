import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RecebimentoMercadoriasService } from '../../services/recebimento-mercadorias.service';
import { Router } from '@angular/router';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';

@Component({
  selector: 'app-busca-recebimento-mercadorias',
  standalone: true,
  templateUrl: './recebimento-mercadorias-busca.component.html',
  styleUrls: ['./recebimento-mercadorias-busca.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule, NavigateToSearchButtonComponent],
  providers: [RecebimentoMercadoriasService]
})
export class RecebimentoMercadoriasBuscaComponent implements OnInit {
  recebimentosMercadoria: any[] = [];
  searchQuery: string = '';
  searchBy: string = 'id';
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;

  // Variáveis para armazenar a última consulta realizada
  lastSearchQuery: string = '';
  lastSearchBy: string = '';

  constructor(private recebimentoMercadoriasService: RecebimentoMercadoriasService, private router: Router) {}

  ngOnInit(): void {
    this.loadRecebimentosMercadoria();
  }

  loadRecebimentosMercadoria(): void {
    this.recebimentoMercadoriasService.buscarRecebimentos(this.page, this.size).subscribe({
      next: (data) => {
        this.recebimentosMercadoria = data.content; // Array de recebimentosMercadoria
        this.totalPages = data.totalPages; // Total de páginas
      },
      error: (err) => {
        console.error('Erro ao carregar recebimentosMercadoria:', err);
      }
    });
  }

  searchRecebimentosMercadoria(): void {
    this.page = 0; // Reinicia a paginação ao buscar

    // Armazena a consulta atual
    this.lastSearchQuery = this.searchQuery;
    this.lastSearchBy = this.searchBy;

    if (!this.searchQuery) {
      this.loadRecebimentosMercadoria();
      return;
    }
  
    if (this.searchBy === 'id') {
      this.recebimentoMercadoriasService.getSimpleRecebimentoById(this.searchQuery).subscribe({
        next: (data) => {
          this.recebimentosMercadoria = data ? [data] : []; // Converte a resposta para um array, ou vazio se não encontrado
          this.totalPages = 1; // Define uma página já que é um único resultado
        },
        error: (err) => {
          console.error('Erro ao buscar pedido por ID:', err);
          this.recebimentosMercadoria = [];
        }
      });
    } else if (this.searchBy === 'cliente') {
      this.recebimentoMercadoriasService.buscarRecebimentoMercadoriasPorRazaoSocial(this.searchQuery, this.page, this.size).subscribe({
        next: (data) => {
          this.recebimentosMercadoria = data.content;
          this.totalPages = data.totalPages;
        },
        error: (err) => {
          console.error('Erro ao buscar recebimentosMercadoria por razão social:', err);
          this.recebimentosMercadoria = [];
        }
      });
    }
  }
  

  navigateToHome(): void {
    this.router.navigate(['/gerencial']);
  }

  viewRecebimento(id: string): void {
    this.router.navigate(['/recebimento-mercadorias-cadastro', id]);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      
      // Verifica se há uma última consulta realizada
      if (this.lastSearchQuery) {
        if (this.lastSearchBy === 'id') {
          this.recebimentoMercadoriasService.getSimpleRecebimentoById(this.lastSearchQuery).subscribe({
            next: (data) => {
              this.recebimentosMercadoria = data ? [data] : []; // Converte a resposta para um array, ou vazio se não encontrado
              this.totalPages = 1; // Define uma página já que é um único resultado
            },
            error: (err) => {
              console.error('Erro ao buscar pedido por ID:', err);
              this.recebimentosMercadoria = [];
            }
          });
        } else if (this.lastSearchBy === 'cliente') {
          this.recebimentoMercadoriasService.buscarRecebimentoMercadoriasPorRazaoSocial(this.lastSearchQuery, this.page, this.size).subscribe({
            next: (data) => {
              this.recebimentosMercadoria = data.content;
              this.totalPages = data.totalPages;
            },
            error: (err) => {
              console.error('Erro ao buscar recebimentos de mercadoria por razão social:', err);
              this.recebimentosMercadoria = [];
            }
          });
        }
      } else {
        // Se não houver uma consulta anterior, carrega todos os recebimentosMercadoria
        this.loadRecebimentosMercadoria();
      }
    }
  }

  createNovoRecebimento(): void {
    this.router.navigate(['/recebimento-mercadorias-cadastro/novo']);
  }
}
