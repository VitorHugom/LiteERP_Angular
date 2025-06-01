// src/app/components/pedidos-relatorio/pedidos-relatorio.component.ts

import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VendedoresService } from '../../services/vendedores.service';
import { ClientesService } from '../../services/clientes.service';
import { TiposCobrancaService } from '../../services/tipos-cobranca.service';
import { PedidosService, PedidosFiltro } from '../../services/pedidos.service';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-pedidos-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent],
  templateUrl: './pedidos-relatorio.component.html',
  styleUrls: ['./pedidos-relatorio.component.scss']
})
export class PedidosRelatorioComponent implements OnInit {
  pedidosRelatorioForm = new FormGroup({
    dataInicio:   new FormControl<string | null>(null),
    dataFim:      new FormControl<string | null>(null),
    vendedorId:   new FormControl<number | null>(null),
    vendedorNome: new FormControl<string>(''),
    clienteId:    new FormControl<number | null>(null),
    clienteNome:  new FormControl<string>(''),
    tipoCobranca: new FormControl<number | null>(null),
    valorInicial: new FormControl<number | null>(null),
    valorFinal:   new FormControl<number | null>(null)
  });

  vendedores: any[] = [];
  showVendedoresList = false;
  vendedorInput = '';

  clientes: any[] = [];
  showClientesList = false;
  clienteInput = '';

  tiposCobranca: any[] = [];

  urlHome = '/gerencial'

  constructor(
    private vendedoresService: VendedoresService,
    private clientesService: ClientesService,
    private cobrancasService: TiposCobrancaService,
    private pedidosService: PedidosService
  ) {}

  ngOnInit(): void {
    // Carrega tipos de cobrança na inicialização
    this.cobrancasService.getTiposCobranca()
      .subscribe(list => {
        this.tiposCobranca = list;
      });
  }

  // ===== VENDEDOR =====
  onSearchVendedores(): void {
    const nome = this.pedidosRelatorioForm.value.vendedorNome?.trim() || '';
    if (nome.length < 2) {
      this.vendedores = [];
      this.showVendedoresList = false;
      this.pedidosRelatorioForm.patchValue({ vendedorId: null });
      return;
    }
    this.vendedoresService
      .searchVendedores(nome, 0, 10)
      .subscribe(list => {
        this.vendedores = list;
        this.showVendedoresList = true;
      });
  }

  onSelectVendedor(v: any): void {
    this.pedidosRelatorioForm.patchValue({
      vendedorId:   v.id,
      vendedorNome: v.nome
    });
    this.vendedorInput = v.nome;
    this.showVendedoresList = false;
  }

  // ===== CLIENTE =====
  onSearchClientes(): void {
    const nome = this.pedidosRelatorioForm.value.clienteNome?.trim() || '';
    if (nome.length < 2) {
      this.clientes = [];
      this.showClientesList = false;
      this.pedidosRelatorioForm.patchValue({ clienteId: null });
      return;
    }
    this.clientesService
      .searchClientes(nome, 0, 10)
      .subscribe(list => {
        this.clientes = list;
        this.showClientesList = true;
      });
  }

  onSelectCliente(c: any): void {
    this.pedidosRelatorioForm.patchValue({
      clienteId:   c.id,
      clienteNome: c.nomeFantasia || c.razaoSocial
    });
    this.clienteInput = c.nomeFantasia || c.razaoSocial;
    this.showClientesList = false;
  }

  // ===== SUBMIT =====
  onSubmit(): void {
    if (this.pedidosRelatorioForm.invalid) {
      return;
    }

    const f = this.pedidosRelatorioForm.value;
    const filtro: PedidosFiltro = {
      idCliente:      f.clienteId ?? undefined,
      idVendedor:     f.vendedorId ?? undefined,
      dataEmissaoInicio:     f.dataInicio ?? undefined,
      dataEmissaoFim:        f.dataFim ?? undefined,
      valorTotalInical:   f.valorInicial ?? undefined,
      valorTotalFinal:     f.valorFinal ?? undefined,
      status:         undefined,
      idTipoCobranca: f.tipoCobranca ?? undefined
    };

    this.pedidosService.gerarRelatorio(filtro)
      .subscribe(
        data => {
          const doc = this.gerarPdf(data, filtro);
          this.abrirPdfEmNovaAba(doc);
        },
        err => console.error(err)
      );
  }

  private gerarPdf(dados: any[], filtro: PedidosFiltro): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Relatório de Pedidos de Venda', 14, 20);

    doc.setFontSize(12);
    let yPosFilters = 28;
    doc.text('Filtros Aplicados:', 14, yPosFilters);
    yPosFilters += 6;

    if (filtro.dataEmissaoInicio) {
      const data = filtro.dataEmissaoInicio.split('T')[0];
      doc.text(`Data Emissão Inicial: ${this.formatarDataBR(data)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.dataEmissaoFim) {
      const data = filtro.dataEmissaoFim.split('T')[0];
      doc.text(`Data Emissão Final: ${this.formatarDataBR(data)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (this.pedidosRelatorioForm.value.vendedorNome) {
      doc.text(`Vendedor: ${this.pedidosRelatorioForm.value.vendedorNome}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (this.pedidosRelatorioForm.value.clienteNome) {
      doc.text(`Cliente: ${this.pedidosRelatorioForm.value.clienteNome}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (this.pedidosRelatorioForm.value.tipoCobranca) {
      const tc = this.tiposCobranca.find(t => t.id === this.pedidosRelatorioForm.value.tipoCobranca);
      if (tc) {
        doc.text(`Tipo Cobrança: ${tc.descricao}`, 14, yPosFilters);
        yPosFilters += 6;
      }
    }
    if (this.pedidosRelatorioForm.value.valorInicial != null) {
      doc.text(`Valor Inicial: R$ ${this.pedidosRelatorioForm.value.valorInicial}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (this.pedidosRelatorioForm.value.valorFinal != null) {
      doc.text(`Valor Final: R$ ${this.pedidosRelatorioForm.value.valorFinal}`, 14, yPosFilters);
      yPosFilters += 6;
    }

    const startY = yPosFilters + 4;
    const head = [['ID', 'Cliente', 'Vendedor', 'Data Emissão', 'Valor Total']];
    const body = dados.map(p => [
      p.id,
      p.cliente?.razaoSocial || '',
      p.vendedor?.nome || '',
      p.dataEmissao?.split('T')[0] || '',
      `R$ ${p.valorTotal?.toFixed(2) || '0,00'}`
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

  private formatarDataBR(dataIso: string): string {
    const partes = dataIso.split('-');
    if (partes.length !== 3) {
      return dataIso;
    }
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  private abrirPdfEmNovaAba(doc: jsPDF): void {
    const blob = doc.output('blob');
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
