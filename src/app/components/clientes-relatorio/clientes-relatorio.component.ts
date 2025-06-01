import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ClientesService, ClientesFiltro } from '../../services/clientes.service';
import { VendedoresService } from '../../services/vendedores.service';
import { CidadesService } from '../../services/cidades.service';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';

@Component({
  selector: 'app-clientes-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent],
  templateUrl: './clientes-relatorio.component.html',
  styleUrls: ['./clientes-relatorio.component.scss']
})
export class ClientesRelatorioComponent {
  clientesRelatorioForm = new FormGroup({
    dataInicio:   new FormControl<string | null>(null),
    dataFim:      new FormControl<string | null>(null),
    vendedorId:   new FormControl<number | null>(null),
    vendedorNome: new FormControl<string>(''),
    cidadeId:     new FormControl<number | null>(null),
    cidadeNome:   new FormControl<string>('')
  });

  vendedores: any[] = [];
  showVendedoresList = false;
  vendedorInput = '';

  cidades: any[] = [];
  showCidadesList = false;
  cidadeInput = '';

  urlHome = '/gerencial'

  constructor(
    private clientesService: ClientesService,
    private vendedoresService: VendedoresService,
    private cidadesService: CidadesService
  ) {}

  onSearchVendedores(): void {
    const nome = this.clientesRelatorioForm.value.vendedorNome?.trim() || '';
    if (nome.length < 2) {
      this.vendedores = [];
      this.showVendedoresList = false;
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
    this.clientesRelatorioForm.patchValue({
      vendedorId:   v.id,
      vendedorNome: v.nome
    });
    this.vendedorInput = v.nome;
    this.showVendedoresList = false;
  }

  onSearchCidades(): void {
    const nome = this.clientesRelatorioForm.value.cidadeNome?.trim() || '';
    if (nome.length < 2) {
      this.cidades = [];
      this.showCidadesList = false;
      return;
    }
    this.cidadesService
      .searchCidades(nome, 0, 10)
      .subscribe(list => {
        this.cidades = list;
        this.showCidadesList = true;
      });
  }

  onSelectCidade(c: any): void {
    this.clientesRelatorioForm.patchValue({
      cidadeId:   c.id,
      cidadeNome: c.nome
    });
    this.cidadeInput = c.nome;
    this.showCidadesList = false;
  }

  onSubmit(): void {
    if (this.clientesRelatorioForm.invalid) {
      return;
    }
    const f = this.clientesRelatorioForm.value;
    const filtro: ClientesFiltro = {
      dataNascimentoInicial: f.dataInicio!, // string no formato 'YYYY-MM-DD' ou null
      dataNascimentoFinal:   f.dataFim!,
      vendedorId:            f.vendedorId!,
      cidadeId:              f.cidadeId!
    };

    this.clientesService.gerarRelatorio(filtro)
      .subscribe(
        data => {
          const doc = this.gerarDoc(data, filtro);
          this.abrirPdfEmNovaAba(doc);
        },
        err => console.error(err)
      );
  }

  private formatarDataBR(dataIso: string): string {
    if (!dataIso) {
      return dataIso;
    }
    const partes = dataIso.split('-');
    if (partes.length !== 3) {
      return dataIso;
    }
    // partes = [yyyy, mm, dd]
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  private gerarDoc(dados: any[], filtro: ClientesFiltro): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Relatório de Clientes', 14, 20);

    // Texto dos filtros usados
    doc.setFontSize(12);
    let yPosFilters = 28; // posição vertical inicial dos filtros
    doc.text('Filtros Aplicados:', 14, yPosFilters);
    yPosFilters += 6;

    // Se dataNascimentoInicial existir, imprime no formato dd/mm/yyyy
    if (filtro.dataNascimentoInicial) {
      const dataFormatada = this.formatarDataBR(filtro.dataNascimentoInicial);
      doc.text(`Nascimento a partir de: ${dataFormatada}`, 14, yPosFilters);
      yPosFilters += 6;
    }

    // Se dataNascimentoFinal existir, imprime no formato dd/mm/yyyy
    if (filtro.dataNascimentoFinal) {
      const dataFormatada = this.formatarDataBR(filtro.dataNascimentoFinal);
      doc.text(`Nascimento até: ${dataFormatada}`, 14, yPosFilters);
      yPosFilters += 6;
    }

    // Se vendedorNome estiver preenchido, imprime nome do vendedor
    if (this.clientesRelatorioForm.value.vendedorNome) {
      doc.text(`Vendedor: ${this.clientesRelatorioForm.value.vendedorNome}`, 14, yPosFilters);
      yPosFilters += 6;
    }

    // Se cidadeNome estiver preenchido, imprime nome da cidade
    if (this.clientesRelatorioForm.value.cidadeNome) {
      doc.text(`Cidade: ${this.clientesRelatorioForm.value.cidadeNome}`, 14, yPosFilters);
      yPosFilters += 6;
    }

    // Calcula a posição inicial da tabela abaixo dos filtros
    const startY = yPosFilters + 4;

    // Cabeçalho e corpo da tabela (mesmo esquema anterior)
    const head = [['ID', 'Razão Social', 'Vendedor']];
    const body = dados.map(c => [c.id, c.razaoSocial, c.nomeVendedor]);

    autoTable(doc, {
      startY,
      head,
      body,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185] }
    });

    return doc;
  }

  private abrirPdfEmNovaAba(doc: jsPDF): void {
    const blob = doc.output('blob');
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
