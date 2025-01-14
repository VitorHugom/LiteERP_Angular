import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ContasPagarService } from '../../services/contas-pagar.service';

@Component({
  selector: 'app-contas-pagar-busca',
  standalone: true,
  templateUrl: './contas-pagar-busca.component.html',
  styleUrls: ['./contas-pagar-busca.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule],
  providers: [ContasPagarService]
})
export class ContasPagarBuscaComponent implements OnInit {
  contasPagar: any[] = [];
  razaoSocial: string = '';
  dataInicio: string = '';
  dataFim: string = '';
  page: number = 0;
  totalPages: number = 0;

  constructor(private contasPagarService: ContasPagarService, private router: Router) {}

  ngOnInit(): void {
    this.loadContasPagar();
  }

  loadContasPagar(): void {
    this.contasPagarService.getContasPagar(this.page).subscribe({
      next: (data) => {
        this.contasPagar = data.content;
        this.totalPages = data.totalPages;
      },
      error: (err) => console.error('Erro ao carregar contas a pagar:', err)
    });
  }

  searchContasPagar(): void {
    this.contasPagarService.buscarContasPagarPorFiltro(this.razaoSocial, this.dataInicio, this.dataFim, this.page).subscribe({
      next: (data) => {
        this.contasPagar = data.content;
        this.totalPages = data.totalPages;
      },
      error: (err) => {
        console.error('Erro ao buscar contas a pagar:', err);
        this.contasPagar = [];
      }
    });
  }

  viewConta(id: string): void {
    this.router.navigate(['/contas-pagar', id]);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.searchContasPagar();
    }
  }

  navigateToHome(): void {
    this.router.navigate(['/gerencial']);
  }

  createNovaConta(): void {
    this.router.navigate(['/contas-pagar/novo']);
  }
}
