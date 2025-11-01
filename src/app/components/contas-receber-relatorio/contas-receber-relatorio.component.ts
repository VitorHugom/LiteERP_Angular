// src/app/components/contas-receber-relatorio/contas-receber-relatorio.component.ts
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';
import { ClientesService } from '../../services/clientes.service';
import { TiposCobrancaService } from '../../services/tipos-cobranca.service';
import { FormaPagamentoService } from '../../services/forma-pagamento.service';
import { ContasReceberService, ContasReceberFiltro, ContasReceberResponse } from '../../services/contas-receber.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-contas-receber-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent],
  templateUrl: './contas-receber-relatorio.component.html',
  styleUrls: ['./contas-receber-relatorio.component.scss']
})
export class ContasReceberRelatorioComponent implements OnInit {
  contasReceberRelatorioForm = new FormGroup({
    dataRecebimentoInicio: new FormControl<string | null>(null),
    dataRecebimentoFinal:  new FormControl<string | null>(null),
    clienteId:             new FormControl<number | null>(null),
    clienteNome:           new FormControl<string>('', { nonNullable: true }),
    tipoCobranca:          new FormControl<number | null>(null),
    formaPagamento:        new FormControl<number | null>(null),
    valorTotalInicial:     new FormControl<number | null>(null),
    valorTotalFinal:       new FormControl<number | null>(null),
  });

  clientes: any[] = [];
  showClientesList = false;
  clienteInput = '';

  tiposCobranca: any[] = [];
  formasPagamento: any[] = [];

  urlHome = '/gerencial';

  constructor(
    private clientesService: ClientesService,
    private tiposCobrancaService: TiposCobrancaService,
    private formaPagamentoService: FormaPagamentoService,
    private contasReceberService: ContasReceberService
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

  onSearchClientes(): void {
    const nomeControl = this.contasReceberRelatorioForm.get('clienteNome');
    const nome = nomeControl?.value.trim() || '';
    if (nome.length < 2) {
      this.clientes = [];
      this.showClientesList = false;
      this.contasReceberRelatorioForm.patchValue({ clienteId: null });
      return;
    }
    this.clientesService.searchClientes(nome, 0, 10)
      .subscribe(list => {
        this.clientes = list;
        this.showClientesList = true;
      });
  }
  onSelectCliente(c: any): void {
    this.contasReceberRelatorioForm.patchValue({
      clienteId:   c.id,
      clienteNome: c.nomeFantasia || c.razaoSocial
    });
    this.clienteInput = c.nomeFantasia || c.razaoSocial;
    this.showClientesList = false;
  }

  onSubmit(): void {
    if (this.contasReceberRelatorioForm.invalid) {
      return;
    }

    const f = this.contasReceberRelatorioForm.value;
    const filtro: ContasReceberFiltro = {
      dataRecebimentoInicio: f.dataRecebimentoInicio ?? undefined,
      dataRecebimentoFim:    f.dataRecebimentoFinal ?? undefined,
      idCliente:             f.clienteId ?? undefined,
      idTipoCobranca:        f.tipoCobranca ?? undefined,
      idFormaPagamento:      f.formaPagamento ?? undefined,
      valorTotalInicial:     f.valorTotalInicial ?? undefined,
      valorTotalFinal:       f.valorTotalFinal ?? undefined
    };

    this.contasReceberService.gerarRelatorio(filtro)
      .subscribe(
        (data: ContasReceberResponse[]) => {
          const doc = this.gerarPdf(data, filtro);
          this.abrirPdfEmNovaAba(doc);
        },
        err => console.error(err)
      );
  }

  private gerarPdf(dados: ContasReceberResponse[], filtro: ContasReceberFiltro): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Relatório de Contas a Receber', 14, 20);

    doc.setFontSize(12);
    let yPosFilters = 28;
    doc.text('Filtros Aplicados:', 14, yPosFilters);
    yPosFilters += 6;

    if (filtro.dataRecebimentoInicio) {
      doc.text(`Recebimento Início: ${this.formatarDataBR(filtro.dataRecebimentoInicio)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.dataRecebimentoFim) {
      doc.text(`Recebimento Fim: ${this.formatarDataBR(filtro.dataRecebimentoFim)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.idCliente) {
      doc.text(`Cliente: ${this.contasReceberRelatorioForm.value.clienteNome}`, 14, yPosFilters);
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
      const fp = this.formasPagamento.find(f => f.id === filtro.idFormaPagamento);
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
      'ID', 'Cliente', 'Número Documento', 'Parcela',
      'Valor Parcela', 'Valor Total', 'Forma Pagamento',
      'Tipo Cobrança', 'Data Vencimento', 'Status'
    ]];

    const body = dados.map(c => [
      c.id,
      c.cliente.razaoSocial,
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
