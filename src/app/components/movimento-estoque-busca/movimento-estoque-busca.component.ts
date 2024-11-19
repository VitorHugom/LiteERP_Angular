import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MovimentoEstoqueService } from '../../services/movimento-estoque.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-busca-movimento-estoque',
  standalone: true,
  templateUrl: './movimento-estoque-busca.component.html',
  styleUrls: ['./movimento-estoque-busca.component.scss'],
  imports: [FormsModule, CommonModule, RouterModule],
  providers: [MovimentoEstoqueService]
})
export class MovimentoEstoqueBuscaComponent implements OnInit {
  movimentos: any[] = [];
  dataInicio: string = '';
  dataFim: string = '';
  page: number = 0;
  size: number = 10;
  totalPages: number = 0;

  // Propriedades booleanas para controle de exibição das colunas
  exibirColunaPedido: boolean = false;
  exibirColunaRecebimento: boolean = false;

  constructor(private movimentoEstoqueService: MovimentoEstoqueService, private router: Router) {}

  ngOnInit(): void {
    this.loadMovimentos();
  }

  loadMovimentos(): void {
    const formattedStartDate = this.dataInicio ? this.dataInicio : '';
    const formattedEndDate = this.dataFim ? this.dataFim : '';

    this.movimentoEstoqueService.buscarMovimentosPorDatas(formattedStartDate, formattedEndDate, this.page, this.size).subscribe({
      next: (data) => {
        this.movimentos = data.content;
        this.totalPages = data.totalPages;

        // Atualiza as propriedades booleanas com base nos dados carregados
        this.exibirColunaPedido = this.movimentos.some(movimento => movimento.idPedido !== null);
        this.exibirColunaRecebimento = this.movimentos.some(movimento => movimento.idRecebimentoMercadoria !== null);
      },
      error: (err) => {
        console.error('Erro ao carregar movimentos de estoque:', err);
      }
    });
  }

  searchMovimentos(): void {
    this.page = 0; // Reinicia a paginação ao buscar
    this.loadMovimentos();
  }

  navigateToHome(): void {
    this.router.navigate(['/gerencial-home']);
  }

  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.page = page;
      this.loadMovimentos();
    }
  }
}
