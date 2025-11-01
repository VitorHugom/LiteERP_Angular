// src/app/components/contas-pagar-relatorio/contas-pagar-relatorio.component.ts
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';
import { FornecedoresService } from '../../services/fornecedores.service';
import { TiposCobrancaService } from '../../services/tipos-cobranca.service';
import { FormaPagamentoService } from '../../services/forma-pagamento.service';
import { ContasPagarService, ContasPagarFiltro, ContasPagarResponse } from '../../services/contas-pagar.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-contas-pagar-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent],
  templateUrl: './contas-pagar-relatorio.component.html',
  styleUrls: ['./contas-pagar-relatorio.component.scss']
})
export class ContasPagarRelatorioComponent implements OnInit {
  contasPagarRelatorioForm = new FormGroup({
    dataVencimentoInicio: new FormControl<string | null>(null),
    dataVencimentoFinal:  new FormControl<string | null>(null),
    fornecedorId:         new FormControl<number | null>(null),
    fornecedorNome:       new FormControl<string>('', { nonNullable: true }),
    tipoCobranca:         new FormControl<number | null>(null),
    formaPagamento:       new FormControl<number | null>(null),
    valorTotalInicial:    new FormControl<number | null>(null),
    valorTotalFinal:      new FormControl<number | null>(null),
  });

  fornecedores: any[] = [];
  showFornecedoresList = false;
  fornecedorInput = '';

  tiposCobranca: any[] = [];
  formasPagamento: any[] = [];

  urlHome = '/gerencial';

  constructor(
    private fornecedoresService: FornecedoresService,
    private tiposCobrancaService: TiposCobrancaService,
    private formaPagamentoService: FormaPagamentoService,
    private contasPagarService: ContasPagarService
  ) {}

  ngOnInit(): void {
    this.tiposCobrancaService.getTiposCobranca()
      .subscribe(list => {
        this.tiposCobranca = list;
      });
    this.formaPagamentoService.getFormasPagamento()
      .subscribe(list => {
        this.formasPagamento = list;
      });
  }

  onSearchFornecedores(): void {
    const nomeControl = this.contasPagarRelatorioForm.get('fornecedorNome');
    const nome = nomeControl?.value.trim() || '';
    if (nome.length < 2) {
      this.fornecedores = [];
      this.showFornecedoresList = false;
      this.contasPagarRelatorioForm.patchValue({ fornecedorId: null });
      return;
    }
    this.fornecedoresService.searchFornecedores(nome, 0, 10)
      .subscribe(list => {
        this.fornecedores = list;
        this.showFornecedoresList = true;
      });
  }

  onSelectFornecedor(f: any): void {
    this.contasPagarRelatorioForm.patchValue({
      fornecedorId:   f.id,
      fornecedorNome: f.razaoSocial
    });
    this.fornecedorInput = f.razaoSocial;
    this.showFornecedoresList = false;
  }

  onSubmit(): void {
    if (this.contasPagarRelatorioForm.invalid) {
      return;
    }

    const f = this.contasPagarRelatorioForm.value!;
    const filtro: ContasPagarFiltro = {
      dataVencimentoInicio: f.dataVencimentoInicio || undefined,
      dataVencimentoFim:    f.dataVencimentoFinal || undefined,
      idFornecedor:         f.fornecedorId || undefined,
      idTipoCobranca:       f.tipoCobranca || undefined,
      idFormaPagamento:     f.formaPagamento || undefined,
      valorTotalInicial:    f.valorTotalInicial || undefined,
      valorTotalFinal:      f.valorTotalFinal || undefined
    };

    this.contasPagarService.gerarRelatorio(filtro)
      .subscribe(
        (data: ContasPagarResponse[]) => {
          const doc = this.gerarPdf(data, filtro);
          this.abrirPdfEmNovaAba(doc);
        },
        err => console.error(err)
      );
  }

  private gerarPdf(dados: ContasPagarResponse[], filtro: ContasPagarFiltro): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Relatório de Contas a Pagar', 14, 20);

    doc.setFontSize(12);
    let yPosFilters = 28;
    doc.text('Filtros Aplicados:', 14, yPosFilters);
    yPosFilters += 6;

    if (filtro.dataVencimentoInicio) {
      doc.text(`Vencimento Início: ${this.formatarDataBR(filtro.dataVencimentoInicio)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.dataVencimentoFim) {
      doc.text(`Vencimento Fim: ${this.formatarDataBR(filtro.dataVencimentoFim)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.idFornecedor) {
      const nomeFornecedor = this.contasPagarRelatorioForm.get('fornecedorNome')?.value || '';
      doc.text(`Fornecedor: ${nomeFornecedor}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.idTipoCobranca) {
      const tc = this.tiposCobranca.find(t => t.id === filtro.idTipoCobranca);
      if (tc) {
        doc.text(`Tipo Cobrança: ${tc.descricao}`, 14, yPosFilters);
        yPosFilters += 6;
      }
    }
    if (filtro.idFormaPagamento) {
      const fp = this.formasPagamento.find(fm => fm.id === filtro.idFormaPagamento);
      if (fp) {
        doc.text(`Forma Pagamento: ${fp.descricao}`, 14, yPosFilters);
        yPosFilters += 6;
      }
    }
    if (filtro.valorTotalInicial != null) {
      doc.text(`Valor Inicial: R$ ${filtro.valorTotalInicial.toFixed(2)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.valorTotalFinal != null) {
      doc.text(`Valor Final: R$ ${filtro.valorTotalFinal.toFixed(2)}`, 14, yPosFilters);
      yPosFilters += 6;
    }

    const startY = yPosFilters + 4;
    const head = [[
      'ID', 'Fornecedor', 'Número Documento', 'Parcela',
      'Valor Parcela', 'Valor Total', 'Forma Pagamento',
      'Tipo Cobrança', 'Data Vencimento', 'Status'
    ]];

    const body = dados.map(c => [
      c.id,
      c.fornecedor.razaoSocial,
      c.numeroDocumento,
      c.parcela,
      `R$ ${c.valorParcela.toFixed(2)}`,
      `R$ ${c.valorTotal.toFixed(2)}`,
      c.formaPagamento.descricao,
      c.tipoCobranca.descricao,
      this.formatarDataVencimento(c.dataVencimento),
      c.status
    ]);

    autoTable(doc, {
      startY,
      head,
      body,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    return doc;
  }

  /**
   * Formata a data de vencimento que pode vir como array Java ou string
   */
  private formatarDataVencimento(dataVencimento: any): string {
    if (!dataVencimento) return '';

    // Se for array Java LocalDate [year, month, day]
    if (Array.isArray(dataVencimento) && dataVencimento.length >= 3) {
      const [year, month, day] = dataVencimento;
      const dataISO = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return this.formatarDataBR(dataISO);
    }

    // Se for string ISO
    if (typeof dataVencimento === 'string') {
      const data = dataVencimento.split('T')[0];
      return this.formatarDataBR(data);
    }

    return '';
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
