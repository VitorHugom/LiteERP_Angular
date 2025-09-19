import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';
import { SeletorContaCaixaComponent } from '../shared/seletor-conta-caixa/seletor-conta-caixa.component';
import { FluxoCaixaService, ContaCaixa } from '../../services/fluxo-caixa.service';
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

    // Simular dados do relatório (substituir pela chamada real da API)
    const dadosSimulados: FluxoCaixaRelatorioResponse = {
      movimentos: [
        {
          id: 1,
          data: '2024-01-15',
          descricao: 'Recebimento - Cliente ABC Ltda',
          tipo: 'ENTRADA',
          valor: 1500.00,
          saldoAnterior: 0,
          saldoAtual: 1500.00,
          origem: 'Contas a Receber',
          documento: 'REC-001'
        },
        {
          id: 2,
          data: '2024-01-16',
          descricao: 'Pagamento - Fornecedor XYZ S.A.',
          tipo: 'SAIDA',
          valor: 800.00,
          saldoAnterior: 1500.00,
          saldoAtual: 700.00,
          origem: 'Contas a Pagar',
          documento: 'PAG-001'
        },
        {
          id: 3,
          data: '2024-01-17',
          descricao: 'Venda à Vista - Cliente DEF',
          tipo: 'ENTRADA',
          valor: 250.00,
          saldoAnterior: 700.00,
          saldoAtual: 950.00,
          origem: 'Vendas',
          documento: 'VEN-001'
        }
      ],
      saldoInicial: 0,
      saldoFinal: 950.00,
      totalEntradas: 1750.00,
      totalSaidas: 800.00,
      periodo: {
        dataInicio: f.dataInicio,
        dataFim: f.dataFim
      }
    };

    const doc = this.gerarPdf(dadosSimulados, filtro);
    this.abrirPdfEmNovaAba(doc);
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
