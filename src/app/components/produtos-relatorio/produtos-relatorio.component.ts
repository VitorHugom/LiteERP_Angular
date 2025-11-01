import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { ProdutosService, ProdutosFiltro } from '../../services/produtos.service';
import { GrupoProdutosService } from '../../services/grupo-produtos.service';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-produtos-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent],
  templateUrl: './produtos-relatorio.component.html',
  styleUrls: ['./produtos-relatorio.component.scss']
})
export class ProdutosRelatorioComponent implements OnInit {
  produtosRelatorioForm = new FormGroup({
    dataCompraInicio:    new FormControl<string | null>(null),
    dataCompraFinal:     new FormControl<string | null>(null),
    grupoProdutoId:      new FormControl<number | null>(null),
    precoVendaInicio:    new FormControl<number | null>(null),
    precoVendaFinal:     new FormControl<number | null>(null),
    precoCustoInicial:   new FormControl<number | null>(null),
    precoCustoFinal:     new FormControl<number | null>(null),
    pesoInicial:         new FormControl<number | null>(null),
    pesoFinal:           new FormControl<number | null>(null)
  });

  grupos: any[] = [];

  urlHome = '/gerencial';

  constructor(
    private produtosService: ProdutosService,
    private grupoProdutosService: GrupoProdutosService
  ) {}

  ngOnInit(): void {
    // Carrega todos os grupos de produto para popular o select
    this.grupoProdutosService.getGruposProdutos()
      .subscribe(list => {
        this.grupos = list;
      });
  }

  onSubmit(): void {
    if (this.produtosRelatorioForm.invalid) {
      return;
    }

    const f = this.produtosRelatorioForm.value;
    const filtro: ProdutosFiltro = {
      dataCompraInicio:    f.dataCompraInicio ?? undefined,
      dataCompraFim:       f.dataCompraFinal ?? undefined,
      grupoId:             f.grupoProdutoId ?? undefined,
      precoVendaInicio:    f.precoVendaInicio ?? undefined,
      precoVendaFim:       f.precoVendaFinal ?? undefined,
      precoCompraInicio:   f.precoCustoInicial ?? undefined,
      precoCompraFim:      f.precoCustoFinal ?? undefined,
      pesoInicio:          f.pesoInicial ?? undefined,
      pesoFim:             f.pesoFinal ?? undefined,
    };

    this.produtosService.gerarRelatorio(filtro)
      .subscribe(
        data => {
          const doc = this.gerarPdf(data, filtro);
          this.abrirPdfEmNovaAba(doc);
        },
        err => console.error(err)
      );
  }

  private gerarPdf(dados: any[], filtro: ProdutosFiltro): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Relatório de Produtos', 14, 20);

    doc.setFontSize(12);
    let yPosFilters = 28;
    doc.text('Filtros Aplicados:', 14, yPosFilters);
    yPosFilters += 6;

    if (filtro.dataCompraInicio) {
      doc.text(`Compra a partir de: ${this.formatarDataBR(filtro.dataCompraInicio)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.dataCompraFim) {
      doc.text(`Compra até: ${this.formatarDataBR(filtro.dataCompraFim)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.grupoId) {
      const grp = this.grupos.find(g => g.id === filtro.grupoId);
      if (grp) {
        doc.text(`Grupo: ${grp.nome}`, 14, yPosFilters);
        yPosFilters += 6;
      }
    }
    if (filtro.precoVendaInicio != null) {
      doc.text(`Preço Venda Inícial: R$ ${filtro.precoVendaInicio.toFixed(2)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.precoVendaFim != null) {
      doc.text(`Preço Venda Final: R$ ${filtro.precoVendaFim.toFixed(2)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.precoCompraInicio != null) {
      doc.text(`Preço Custo Inicial: R$ ${filtro.precoCompraInicio.toFixed(2)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.precoCompraFim != null) {
      doc.text(`Preço Custo Final: R$ ${filtro.precoCompraFim.toFixed(2)}`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.pesoInicio != null) {
      doc.text(`Peso Inicial: ${filtro.pesoInicio.toFixed(3)} kg`, 14, yPosFilters);
      yPosFilters += 6;
    }
    if (filtro.pesoFim != null) {
      doc.text(`Peso Final: ${filtro.pesoFim.toFixed(3)} kg`, 14, yPosFilters);
      yPosFilters += 6;
    }

    const startY = yPosFilters + 4;
    const head = [['ID', 'Descrição', 'Grupo', 'Data Compra', 'Preço Venda', 'Preço Custo', 'Peso (kg)']];
    const body = dados.map(p => [
      p.id,
      p.descricao,
      p.grupoProdutos?.nome || '',
      this.formatarDataUltimaCompra(p.dataUltimaCompra),
      `R$ ${p.precoVenda?.toFixed(2) || '0,00'}`,
      `R$ ${p.precoCompra?.toFixed(2) || '0,00'}`,
      p.peso?.toFixed(3) || '0.000'
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
   * Formata a data de última compra que pode vir como array Java ou string
   */
  private formatarDataUltimaCompra(dataUltimaCompra: any): string {
    if (!dataUltimaCompra) return '';

    // Se for array Java LocalDate [year, month, day]
    if (Array.isArray(dataUltimaCompra) && dataUltimaCompra.length >= 3) {
      const [year, month, day] = dataUltimaCompra;
      const dataISO = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return this.formatarDataBR(dataISO);
    }

    // Se for string ISO
    if (typeof dataUltimaCompra === 'string') {
      return this.formatarDataBR(dataUltimaCompra);
    }

    return '';
  }

  private formatarDataBR(dataIso: string): string {
    // dataIso no formato "YYYY-MM-DD"
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
