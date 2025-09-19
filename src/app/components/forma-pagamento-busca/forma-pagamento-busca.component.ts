import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormaPagamentoService } from '../../services/forma-pagamento.service';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';

@Component({
  selector: 'app-forma-pagamento-busca',
  standalone: true,
  templateUrl: './forma-pagamento-busca.component.html',
  styleUrls: ['./forma-pagamento-busca.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule, NavigateToSearchButtonComponent],
  providers: [FormaPagamentoService]
})
export class FormaPagamentoBuscaComponent implements OnInit {
  formas: any[] = [];
  filteredFormas: any[] = [];
  searchQuery: string = '';
  searchBy: string = 'nome';
  page: number = 0;
  totalPages: number = 0;

  constructor(private formaPagamentoService: FormaPagamentoService, private router: Router) {}

  ngOnInit(): void {
    this.loadFormas();
  }

  loadFormas(): void {
    this.formaPagamentoService.getFormasPagamentoBusca(this.page).subscribe({
      next: (data) => {
        this.formas = data.content;
        this.filteredFormas = this.formas;
        this.totalPages = data.totalPages;
      },
      error: (err) => console.error('Erro ao carregar formas de pagamento:', err)
    });
  }

  searchFormas(): void {
    if (this.searchQuery === '') {
      this.loadFormas();
      return;
    }

    if (this.searchBy === 'id') {
      const id = Number(this.searchQuery);
      if (!isNaN(id)) {
        this.formaPagamentoService.getFormaPagamentoById(id).subscribe({
          next: (data) => this.filteredFormas = [data],
          error: (err) => { console.error('Erro ao buscar por ID:', err); this.filteredFormas = []; }
        });
      }
    } else {
      this.formaPagamentoService.buscarFormasPagamentoPorDescricao(this.searchQuery, this.page).subscribe({
        next: (data) => {
          this.filteredFormas = data.content;
          this.totalPages = data.totalPages;
        },
        error: (err) => { console.error('Erro ao buscar por nome:', err); this.filteredFormas = []; }
      });
    }
  }

  viewForma(id: string): void {
    this.router.navigate(['/forma-pagamento', id]);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.loadFormas();
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/gerencial']);
  }

  createNovaForma(): void {
    this.router.navigate(['/forma-pagamento/novo']);
  }
}
