import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraficoBarrasContasPagarComponent } from '../../../../components/shared/grafico-barras-contas-pagar/grafico-barras-contas-pagar.component';
import { GraficoLinhasContasPagarComponent } from '../../../../components/shared/grafico-linhas-contas-pagar/grafico-linhas-contas-pagar.component';
import { ModalFiltroDatasComponent, FiltroData } from '../../../../components/shared/modal-filtro-datas/modal-filtro-datas.component';
import { ContasPagarService, ContasPagarGraficoItem } from '../../../../services/contas-pagar.service';

@Component({
  selector: 'app-conteudo',
  standalone: true,
  imports: [
    CommonModule,
    GraficoBarrasContasPagarComponent,
    GraficoLinhasContasPagarComponent,
    ModalFiltroDatasComponent
  ],
  templateUrl: './conteudo.component.html',
  styleUrl: './conteudo.component.scss'
})
export class ConteudoComponent implements OnInit {
  // Dados separados para cada gráfico
  dadosGraficoBarras: ContasPagarGraficoItem[] = [];
  dadosGraficoLinhas: ContasPagarGraficoItem[] = [];

  carregandoDadosBarras = false;
  carregandoDadosLinhas = false;
  erroBarras: string | null = null;
  erroLinhas: string | null = null;

  // Modal de filtro
  modalFiltroVisivel = false;
  graficoAtivo: 'barras' | 'linhas' = 'barras';

  // Períodos separados para cada gráfico
  dataInicialBarras = '';
  dataFinalBarras = '';
  dataInicialLinhas = '';
  dataFinalLinhas = '';

  constructor(private contasPagarService: ContasPagarService) {}

  ngOnInit(): void {
    this.definirPeriodoPadrao();
    this.carregarDadosGraficoBarras();
    this.carregarDadosGraficoLinhas();
  }

  private definirPeriodoPadrao(): void {
    // Período: 1 ano atrás até 1 semana à frente
    const hoje = new Date();
    const dataInicio = new Date();
    dataInicio.setFullYear(hoje.getFullYear() - 1);

    const dataFim = new Date();
    dataFim.setDate(hoje.getDate() + 7);

    const dataInicioStr = dataInicio.toISOString().split('T')[0];
    const dataFimStr = dataFim.toISOString().split('T')[0];

    // Definir o mesmo período padrão para ambos os gráficos
    this.dataInicialBarras = dataInicioStr;
    this.dataFinalBarras = dataFimStr;
    this.dataInicialLinhas = dataInicioStr;
    this.dataFinalLinhas = dataFimStr;
  }

  private carregarDadosGraficoBarras(): void {
    this.carregandoDadosBarras = true;
    this.erroBarras = null;

    this.contasPagarService.getRelatorioGrafico(
      this.dataInicialBarras,
      this.dataFinalBarras,
      'aberta',
      0,
      50,
      'dataVencimento,asc'
    ).subscribe({
      next: (response) => {
        this.dadosGraficoBarras = response.content;
        this.carregandoDadosBarras = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do gráfico de barras:', error);
        this.erroBarras = 'Erro ao carregar dados do gráfico de barras.';
        this.carregandoDadosBarras = false;
      }
    });
  }

  private carregarDadosGraficoLinhas(): void {
    this.carregandoDadosLinhas = true;
    this.erroLinhas = null;

    this.contasPagarService.getRelatorioGrafico(
      this.dataInicialLinhas,
      this.dataFinalLinhas,
      'aberta',
      0,
      50,
      'dataVencimento,asc'
    ).subscribe({
      next: (response) => {
        this.dadosGraficoLinhas = response.content;
        this.carregandoDadosLinhas = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do gráfico de linhas:', error);
        this.erroLinhas = 'Erro ao carregar dados do gráfico de linhas.';
        this.carregandoDadosLinhas = false;
      }
    });
  }

  recarregarDados(): void {
    this.carregarDadosGraficoBarras();
    this.carregarDadosGraficoLinhas();
  }

  // Métodos do modal de filtro
  abrirModalFiltroBarras(): void {
    this.graficoAtivo = 'barras';
    this.modalFiltroVisivel = true;
  }

  abrirModalFiltroLinhas(): void {
    this.graficoAtivo = 'linhas';
    this.modalFiltroVisivel = true;
  }

  fecharModalFiltro(): void {
    this.modalFiltroVisivel = false;
  }

  aplicarFiltro(filtro: FiltroData): void {
    if (this.graficoAtivo === 'barras') {
      this.dataInicialBarras = filtro.dataInicio;
      this.dataFinalBarras = filtro.dataFim;
      this.carregarDadosGraficoBarras();
    } else {
      this.dataInicialLinhas = filtro.dataInicio;
      this.dataFinalLinhas = filtro.dataFim;
      this.carregarDadosGraficoLinhas();
    }
  }

  cancelarFiltro(): void {
    // Não faz nada, apenas fecha o modal
  }

  // Getters para o modal
  get dataInicialAtual(): string {
    return this.graficoAtivo === 'barras' ? this.dataInicialBarras : this.dataInicialLinhas;
  }

  get dataFinalAtual(): string {
    return this.graficoAtivo === 'barras' ? this.dataFinalBarras : this.dataFinalLinhas;
  }

  get tituloModalAtual(): string {
    return this.graficoAtivo === 'barras'
      ? 'Filtrar Periodo - Grafico de Valores'
      : 'Filtrar Periodo - Grafico de Quantidades';
  }
}
