import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraficoBarrasContasPagarComponent } from '../../../../components/shared/grafico-barras-contas-pagar/grafico-barras-contas-pagar.component';
import { GraficoLinhasContasPagarComponent } from '../../../../components/shared/grafico-linhas-contas-pagar/grafico-linhas-contas-pagar.component';
import { ContasPagarService, ContasPagarGraficoItem } from '../../../../services/contas-pagar.service';

@Component({
  selector: 'app-conteudo',
  standalone: true,
  imports: [
    CommonModule,
    GraficoBarrasContasPagarComponent,
    GraficoLinhasContasPagarComponent
  ],
  templateUrl: './conteudo.component.html',
  styleUrl: './conteudo.component.scss'
})
export class ConteudoComponent implements OnInit {
  dadosGrafico: ContasPagarGraficoItem[] = [];
  carregandoDados = false;
  erro: string | null = null;

  constructor(private contasPagarService: ContasPagarService) {}

  ngOnInit(): void {
    this.carregarDadosGrafico();
  }

  private carregarDadosGrafico(): void {
    this.carregandoDados = true;
    this.erro = null;

    const dataFim = new Date();
    const dataInicio = new Date();
    dataInicio.setFullYear(dataFim.getFullYear() - 1);

    const dataInicioStr = dataInicio.toISOString().split('T')[0];
    const dataFimStr = dataFim.toISOString().split('T')[0];

    this.contasPagarService.getRelatorioGrafico(
      dataInicioStr,
      dataFimStr,
      'aberta',
      0,
      50, // Buscar mais dados para o gráfico
      'dataVencimento,asc'
    ).subscribe({
      next: (response) => {
        this.dadosGrafico = response.content;
        this.carregandoDados = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do gráfico:', error);
        this.erro = 'Erro ao carregar dados dos gráficos. Tente novamente mais tarde.';
        this.carregandoDados = false;
      }
    });
  }

  recarregarDados(): void {
    this.carregarDadosGrafico();
  }
}
