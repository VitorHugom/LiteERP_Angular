import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ContasReceberService } from '../../services/contas-receber.service';

@Component({
  selector: 'app-contas-receber-busca',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './contas-receber-busca.component.html',
  styleUrl: './contas-receber-busca.component.scss'
})
export class ContasReceberBuscaComponent {
contasReceber: any[] = [];
  razaoSocial: string = '';
  dataInicio: string = '';
  dataFim: string = '';
  page: number = 0;
  totalPages: number = 0;

  constructor(
    private contasReceberService: ContasReceberService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadReceberPagar();
  }

  loadReceberPagar(): void {
    this.contasReceberService.getContasReceber(this.page).subscribe({
      next: (data) => {
        this.contasReceber = data.content;
        this.totalPages = data.totalPages;
      },
      error: (err) => console.error('Erro ao carregar contas a receber:', err)
    });
  }

  searchContasReceber(): void {
    this.contasReceberService.buscarContasReceberPorFiltro(this.razaoSocial, this.dataInicio, this.dataFim, this.page).subscribe({
      next: (data) => {
        this.contasReceber = data.content;
        this.totalPages = data.totalPages;
      },
      error: (err) => {
        console.error('Erro ao buscar contas a receber:', err);
        this.contasReceber = [];
      }
    });
  }

  viewConta(id: string): void {
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
