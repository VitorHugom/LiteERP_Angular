import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GraficoBarrasContasPagarComponent } from '../../../../components/shared/grafico-barras-contas-pagar/grafico-barras-contas-pagar.component';
import { GraficoLinhasContasPagarComponent } from '../../../../components/shared/grafico-linhas-contas-pagar/grafico-linhas-contas-pagar.component';
import { GraficoBarrasContasReceberComponent } from '../../../../components/shared/grafico-barras-contas-receber/grafico-barras-contas-receber.component';
import { GraficoLinhasContasReceberComponent } from '../../../../components/shared/grafico-linhas-contas-receber/grafico-linhas-contas-receber.component';
import { ModalFiltroDatasComponent, FiltroData } from '../../../../components/shared/modal-filtro-datas/modal-filtro-datas.component';
import { ContasPagarService, ContasPagarGraficoItem } from '../../../../services/contas-pagar.service';
import { ContasReceberService, ContasReceberGraficoResponse, ContasReceberGraficoItem } from '../../../../services/contas-receber.service';

@Component({
  selector: 'app-conteudo',
  standalone: true,
  imports: [
    CommonModule,
    GraficoBarrasContasPagarComponent,
    GraficoLinhasContasPagarComponent,
    GraficoBarrasContasReceberComponent,
    GraficoLinhasContasReceberComponent,
    ModalFiltroDatasComponent
  ],
  templateUrl: './conteudo.component.html',
  styleUrl: './conteudo.component.scss'
})
export class ConteudoComponent implements OnInit {
  dadosGraficoBarras: ContasPagarGraficoItem[] = [];
  dadosGraficoLinhas: ContasPagarGraficoItem[] = [];
  dadosGraficoBarrasReceber: ContasReceberGraficoItem[] = [];
  dadosGraficoLinhasReceber: ContasReceberGraficoItem[] = [];

  carregandoDadosBarras = false;
  carregandoDadosLinhas = false;
  carregandoDadosBarrasReceber = false;
  carregandoDadosLinhasReceber = false;
  erroBarras: string | null = null;
  erroLinhas: string | null = null;
  erroBarrasReceber: string | null = null;
  erroLinhasReceber: string | null = null;

  modalFiltroVisivel = false;
  graficoAtivo: 'barras' | 'linhas' | 'barrasReceber' | 'linhasReceber' = 'barras';

  dataInicialBarras = '';
  dataFinalBarras = '';
  dataInicialLinhas = '';
  dataFinalLinhas = '';
  dataInicialBarrasReceber = '';
  dataFinalBarrasReceber = '';
  dataInicialLinhasReceber = '';
  dataFinalLinhasReceber = '';

  constructor(
    private contasPagarService: ContasPagarService,
    private contasReceberService: ContasReceberService
  ) {}

  ngOnInit(): void {
    this.definirPeriodoPadrao();
    this.carregarDadosGraficoBarras();
    this.carregarDadosGraficoLinhas();
    this.carregarDadosGraficoBarrasReceber();
    this.carregarDadosGraficoLinhasReceber();
  }

  private definirPeriodoPadrao(): void {
    const hoje = new Date();
    const dataInicio = new Date();
    dataInicio.setFullYear(hoje.getFullYear() - 1);

    const dataFim = new Date();
    dataFim.setDate(hoje.getDate() + 7);

    const dataInicioStr = dataInicio.toISOString().split('T')[0];
    const dataFimStr = dataFim.toISOString().split('T')[0];

    this.dataInicialBarras = dataInicioStr;
    this.dataFinalBarras = dataFimStr;
    this.dataInicialLinhas = dataInicioStr;
    this.dataFinalLinhas = dataFimStr;
    const dataInicioReceber = new Date();
    dataInicioReceber.setDate(hoje.getDate() - 7);
    const dataFimReceber = new Date();
    dataFimReceber.setMonth(hoje.getMonth() + 3);

    const dataInicioReceberStr = dataInicioReceber.toISOString().split('T')[0];
    const dataFimReceberStr = dataFimReceber.toISOString().split('T')[0];

    this.dataInicialBarrasReceber = dataInicioReceberStr;
    this.dataFinalBarrasReceber = dataFimReceberStr;
    this.dataInicialLinhasReceber = dataInicioReceberStr;
    this.dataFinalLinhasReceber = dataFimReceberStr;
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

  private carregarDadosGraficoBarrasReceber(): void {
    this.carregandoDadosBarrasReceber = true;
    this.erroBarrasReceber = null;

    this.contasReceberService.getRelatorioGrafico(
      this.dataInicialBarrasReceber,
      this.dataFinalBarrasReceber,
      'aberta',
      0,
      50,
      'dataVencimento,asc'
    ).subscribe({
      next: (response) => {
        this.dadosGraficoBarrasReceber = response.content || [];
        this.carregandoDadosBarrasReceber = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do gráfico de barras de contas a receber:', error);
        this.erroBarrasReceber = 'Erro ao carregar dados do gráfico de barras.';
        this.carregandoDadosBarrasReceber = false;
      }
    });
  }

  private carregarDadosGraficoLinhasReceber(): void {
    this.carregandoDadosLinhasReceber = true;
    this.erroLinhasReceber = null;

    this.contasReceberService.getRelatorioGrafico(
      this.dataInicialLinhasReceber,
      this.dataFinalLinhasReceber,
      'aberta',
      0,
      50,
      'dataVencimento,asc'
    ).subscribe({
      next: (response) => {
        this.dadosGraficoLinhasReceber = response.content || [];
        this.carregandoDadosLinhasReceber = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dados do gráfico de linhas de contas a receber:', error);
        this.erroLinhasReceber = 'Erro ao carregar dados do gráfico de linhas.';
        this.carregandoDadosLinhasReceber = false;
      }
    });
  }

  recarregarDados(): void {
    this.carregarDadosGraficoBarras();
    this.carregarDadosGraficoLinhas();
    this.carregarDadosGraficoBarrasReceber();
    this.carregarDadosGraficoLinhasReceber();
  }

  abrirModalFiltroBarras(): void {
    this.graficoAtivo = 'barras';
    this.modalFiltroVisivel = true;
  }

  abrirModalFiltroLinhas(): void {
    this.graficoAtivo = 'linhas';
    this.modalFiltroVisivel = true;
  }

  abrirModalFiltroBarrasReceber(): void {
    this.graficoAtivo = 'barrasReceber';
    this.modalFiltroVisivel = true;
  }

  abrirModalFiltroLinhasReceber(): void {
    this.graficoAtivo = 'linhasReceber';
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
    } else if (this.graficoAtivo === 'linhas') {
      this.dataInicialLinhas = filtro.dataInicio;
      this.dataFinalLinhas = filtro.dataFim;
      this.carregarDadosGraficoLinhas();
    } else if (this.graficoAtivo === 'barrasReceber') {
      this.dataInicialBarrasReceber = filtro.dataInicio;
      this.dataFinalBarrasReceber = filtro.dataFim;
      this.carregarDadosGraficoBarrasReceber();
    } else if (this.graficoAtivo === 'linhasReceber') {
      this.dataInicialLinhasReceber = filtro.dataInicio;
      this.dataFinalLinhasReceber = filtro.dataFim;
      this.carregarDadosGraficoLinhasReceber();
    }
    this.fecharModalFiltro();
  }

  cancelarFiltro(): void {
    // N�o faz nada, apenas fecha o modal
  }

  // Getters para o modal
  get dataInicialAtual(): string {
    switch (this.graficoAtivo) {
      case 'barras': return this.dataInicialBarras;
      case 'linhas': return this.dataInicialLinhas;
      case 'barrasReceber': return this.dataInicialBarrasReceber;
      case 'linhasReceber': return this.dataInicialLinhasReceber;
      default: return '';
    }
  }

  get dataFinalAtual(): string {
    switch (this.graficoAtivo) {
      case 'barras': return this.dataFinalBarras;
      case 'linhas': return this.dataFinalLinhas;
      case 'barrasReceber': return this.dataFinalBarrasReceber;
      case 'linhasReceber': return this.dataFinalLinhasReceber;
      default: return '';
    }
  }

  get tituloModalAtual(): string {
    switch (this.graficoAtivo) {
      case 'barras': return 'Filtrar Período - Gráfico de Valores (Contas a Pagar)';
      case 'linhas': return 'Filtrar Período - Gráfico de Quantidades (Contas a Pagar)';
      case 'barrasReceber': return 'Filtrar Período - Gráfico de Valores (Contas a Receber)';
      case 'linhasReceber': return 'Filtrar Período - Gráfico de Quantidades (Contas a Receber)';
      default: return 'Filtrar Período';
    }
  }

  get tipoGraficoAtual(): 'pagar' | 'receber' {
    return (this.graficoAtivo === 'barrasReceber' || this.graficoAtivo === 'linhasReceber') ? 'receber' : 'pagar';
  }
}
