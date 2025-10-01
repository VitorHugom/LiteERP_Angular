import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';
import { SeletorContaCaixaComponent } from '../shared/seletor-conta-caixa/seletor-conta-caixa.component';
import { FluxoCaixaService, ContaCaixa, MovimentacaoFluxoCaixaResponse, MovimentacaoFluxoCaixa } from '../../services/fluxo-caixa.service';
import { forkJoin } from 'rxjs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface FluxoCaixaFiltro {
  dataInicio?: string;
  dataFim?: string;
  contaCaixaId?: number;
}



export interface FluxoCaixaMovimento {
  id: number;
  data: string;
  descricao: string;
  tipo: 'ENTRADA' | 'SAIDA';
  valor: number;
  saldoAnterior: number;
  saldoAtual: number;
  origem: string;
  documento?: string;
}

export interface FluxoCaixaRelatorioResponse {
  movimentos: FluxoCaixaMovimento[];
  saldoInicial: number;
  saldoFinal: number;
  totalEntradas: number;
  totalSaidas: number;
  periodo: {
    dataInicio: string;
    dataFim: string;
  };
}

@Component({
  selector: 'app-fluxo-caixa-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent, SeletorContaCaixaComponent],
  templateUrl: './fluxo-caixa-relatorio.component.html',
  styleUrls: ['./fluxo-caixa-relatorio.component.scss']
})
export class FluxoCaixaRelatorioComponent implements OnInit {
  fluxoCaixaRelatorioForm = new FormGroup({
    dataInicio: new FormControl<string | null>(null),
    dataFim: new FormControl<string | null>(null),
    contaCaixaId: new FormControl<number | null>(null)
  });

  contaCaixaSelecionada: ContaCaixa | null = null;
  urlHome = '/gerencial';
  carregandoRelatorio = false;

  constructor(private fluxoCaixaService: FluxoCaixaService) {}

  ngOnInit(): void {
    this.definirPeriodoPadrao();
  }

  private definirPeriodoPadrao(): void {
    const hoje = new Date();
    const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0);

    this.fluxoCaixaRelatorioForm.patchValue({
      dataInicio: inicioMes.toISOString().split('T')[0],
      dataFim: fimMes.toISOString().split('T')[0]
    });
  }

  onContaCaixaSelecionada(conta: ContaCaixa | null): void {
    this.contaCaixaSelecionada = conta;
    this.fluxoCaixaRelatorioForm.patchValue({
      contaCaixaId: conta?.id || null
    });
  }

  onContaCaixaIdSelecionada(contaId: number | null): void {
    this.fluxoCaixaRelatorioForm.patchValue({
      contaCaixaId: contaId
    });
  }

  onSubmit(): void {
    if (this.fluxoCaixaRelatorioForm.invalid) {
      return;
    }

    const f = this.fluxoCaixaRelatorioForm.value;

    if (!f.contaCaixaId) {
      alert('Por favor, selecione uma conta de caixa.');
      return;
    }

    if (!f.dataInicio || !f.dataFim) {
      alert('Por favor, informe o período do relatório.');
      return;
    }

    const filtro: FluxoCaixaFiltro = {
      dataInicio: f.dataInicio,
      dataFim: f.dataFim,
      contaCaixaId: f.contaCaixaId
    };

    // Buscar dados reais da API
    this.carregandoRelatorio = true;

    // Buscar saldo anterior e movimentações em paralelo
    const movimentacoes$ = this.fluxoCaixaService.getMovimentacoesPorConta(
      f.contaCaixaId,
      f.dataInicio,
      f.dataFim
    );

    const saldoAnterior$ = this.fluxoCaixaService.getSaldoAnterior(
      f.contaCaixaId,
      f.dataInicio
    );

    // Combinar as duas requisições usando forkJoin
    forkJoin({
      movimentacoes: movimentacoes$,
      saldoAnterior: saldoAnterior$
    }).subscribe({
      next: (result) => {
        this.carregandoRelatorio = false;
        const dadosRelatorio = this.processarDadosParaRelatorio(
          result.movimentacoes,
          filtro,
          result.saldoAnterior.saldo
        );
        const doc = this.gerarPdf(dadosRelatorio, filtro);
        this.abrirPdfEmNovaAba(doc);
      },
      error: (error) => {
        this.carregandoRelatorio = false;
        console.error('Erro ao buscar dados do fluxo de caixa:', error);

        // Tentar buscar apenas as movimentações se o saldo anterior falhar
        movimentacoes$.subscribe({
          next: (response: MovimentacaoFluxoCaixaResponse) => {
            console.warn('Usando saldo inicial 0 devido ao erro no saldo anterior');
            const dadosRelatorio = this.processarDadosParaRelatorio(response, filtro, 0);
            const doc = this.gerarPdf(dadosRelatorio, filtro);
            this.abrirPdfEmNovaAba(doc);
          },
          error: (movError) => {
            console.error('Erro ao buscar movimentações:', movError);
            alert('Erro ao buscar dados do fluxo de caixa. Tente novamente.');
          }
        });
      }
    });
  }

  private processarDadosParaRelatorio(
    response: MovimentacaoFluxoCaixaResponse,
    filtro: FluxoCaixaFiltro,
    saldoInicial: number = 0
  ): FluxoCaixaRelatorioResponse {
    const movimentacoes = response.content;

    // Ordenar por data para calcular saldos corretamente
    const movimentacoesOrdenadas = movimentacoes.sort((a, b) =>
      new Date(a.dataMovimentacao).getTime() - new Date(b.dataMovimentacao).getTime()
    );

    let saldoAtual = saldoInicial; // Começar com o saldo inicial correto
    let totalEntradas = 0;
    let totalSaidas = 0;

    const movimentos: FluxoCaixaMovimento[] = movimentacoesOrdenadas.map((mov) => {
      const saldoAnterior = saldoAtual;
      const valorMovimento = mov.valor; // Valor já vem em reais

      // Lógica corrigida para tratar valores baseado na categoria
      // Independente do sinal do valor, usamos a categoria para determinar se é entrada ou saída
      const valorAbsoluto = Math.abs(valorMovimento);

      if (mov.categoria === 'RECEITA') {
        // Receitas sempre aumentam o saldo
        saldoAtual += valorAbsoluto;
        totalEntradas += valorAbsoluto;
      } else {
        // Despesas sempre diminuem o saldo
        saldoAtual -= valorAbsoluto;
        totalSaidas += valorAbsoluto;
      }

      return {
        id: mov.id,
        data: mov.dataMovimentacao,
        descricao: mov.descricao,
        tipo: mov.categoria === 'RECEITA' ? 'ENTRADA' : 'SAIDA',
        valor: valorAbsoluto, // Mostrar sempre valor absoluto no relatório
        saldoAnterior: saldoAnterior,
        saldoAtual: saldoAtual,
        origem: mov.tipoMovimentacaoDescricao,
        documento: mov.numeroDocumento
      };
    });

    return {
      movimentos,
      saldoInicial: saldoInicial, // Usar o saldo inicial correto
      saldoFinal: saldoAtual,
      totalEntradas,
      totalSaidas,
      periodo: {
        dataInicio: filtro.dataInicio || '',
        dataFim: filtro.dataFim || ''
      }
    };
  }

  private gerarPdf(dados: FluxoCaixaRelatorioResponse, filtro: FluxoCaixaFiltro): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Relatório de Fluxo de Caixa', 14, 20);

    doc.setFontSize(12);
    let yPosFilters = 28;
    doc.text('Filtros Aplicados:', 14, yPosFilters);
    yPosFilters += 6;

    if (this.contaCaixaSelecionada) {
      doc.text(`Conta: ${this.contaCaixaSelecionada.descricao}`, 14, yPosFilters);
      yPosFilters += 6;
    }

    if (filtro.dataInicio) {
      doc.text(`Período: ${this.formatarDataBR(filtro.dataInicio)} até ${this.formatarDataBR(filtro.dataFim || '')}`, 14, yPosFilters);
      yPosFilters += 6;
    }

    // Resumo
    yPosFilters += 4;
    doc.setFontSize(14);
    doc.text('Resumo do Período:', 14, yPosFilters);
    yPosFilters += 8;

    doc.setFontSize(12);
    doc.text(`Saldo Inicial: R$ ${dados.saldoInicial.toFixed(2)}`, 14, yPosFilters);
    yPosFilters += 6;
    doc.text(`Total de Entradas: R$ ${dados.totalEntradas.toFixed(2)}`, 14, yPosFilters);
    yPosFilters += 6;
    doc.text(`Total de Saídas: R$ ${dados.totalSaidas.toFixed(2)}`, 14, yPosFilters);
    yPosFilters += 6;
    doc.text(`Saldo Final: R$ ${dados.saldoFinal.toFixed(2)}`, 14, yPosFilters);
    yPosFilters += 10;

    const startY = yPosFilters;
    const head = [[
      'Data', 'Descrição', 'Tipo', 'Valor', 'Saldo Anterior', 'Saldo Atual', 'Origem', 'Documento'
    ]];

    const body = dados.movimentos.map(m => [
      this.formatarDataBR(m.data),
      m.descricao,
      m.tipo,
      `R$ ${m.valor.toFixed(2)}`,
      `R$ ${m.saldoAnterior.toFixed(2)}`,
      `R$ ${m.saldoAtual.toFixed(2)}`,
      m.origem,
      m.documento || '-'
    ]);

    autoTable(doc, {
      startY,
      head,
      body,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [41, 128, 185] },
      columnStyles: {
        0: { cellWidth: 20 }, // Data
        1: { cellWidth: 60 }, // Descrição
        2: { cellWidth: 20 }, // Tipo
        3: { cellWidth: 25 }, // Valor
        4: { cellWidth: 25 }, // Saldo Anterior
        5: { cellWidth: 25 }, // Saldo Atual
        6: { cellWidth: 30 }, // Origem
        7: { cellWidth: 25 }  // Documento
      }
    });

    return doc;
  }

  private formatarDataBR(dataIso: string): string {
    const partes = dataIso.split('-');
    if (partes.length !== 3) {
      return dataIso;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  private abrirPdfEmNovaAba(doc: jsPDF): void {
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
