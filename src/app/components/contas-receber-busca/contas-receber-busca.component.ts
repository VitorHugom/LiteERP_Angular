// contas-receber-busca.component.ts
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ContasReceberService } from '../../services/contas-receber.service';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';

@Component({
  selector: 'app-contas-receber-busca',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule, NavigateToSearchButtonComponent],
  templateUrl: './contas-receber-busca.component.html',
  styleUrl: './contas-receber-busca.component.scss'
})
export class ContasReceberBuscaComponent implements OnInit {
  contasReceber: any[] = [];
  razaoSocial = '';
  dataInicio = '';
  dataFim = '';
  page = 0;
  totalPages = 0;

  constructor(
    private contasReceberService: ContasReceberService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadContasReceber();
  }

  loadContasReceber(): void {
    this.contasReceberService.getContasReceber(this.page).subscribe({
      next: data => {
        this.contasReceber = data.content;
        this.totalPages = data.totalPages;
      },
      error: err => console.error('Erro ao carregar contas a receber:', err)
    });
  }

  searchContasReceber(): void {
    this.contasReceberService
      .buscarContasReceberPorFiltro(this.razaoSocial, this.dataInicio, this.dataFim, this.page)
      .subscribe({
        next: data => {
          this.contasReceber = data.content;
          this.totalPages = data.totalPages;
        },
        error: err => {
          console.error('Erro ao buscar contas a receber:', err);
          this.contasReceber = [];
        }
      });
  }

  viewConta(id: number): void {
    this.router.navigate(['/contas-receber', id]);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.searchContasReceber();
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/gerencial']);
  }

  createNovaConta(): void {
    this.router.navigate(['/contas-receber/novo']);
  }
}
