// src/app/clientes-relatorio/clientes-relatorio.component.ts

import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import { ClientesService, ClientesFiltro } from '../../services/clientes.service';
import { VendedoresService } from '../../services/vendedores.service';
import { CidadesService } from '../../services/cidades.service';

@Component({
  selector: 'app-clientes-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
      dataNascimentoInicial: f.dataInicio!,
      dataNascimentoFinal:   f.dataFim!,
      vendedorId:            f.vendedorId!,
      cidadeId:              f.cidadeId!
    };
    this.clientesService.gerarRelatorio(filtro)
      .subscribe(data => {
        const doc = this.gerarDoc(data);
        this.abrirPdfEmNovaAba(doc);
      }, err => console.error(err));
  }

  private gerarDoc(dados: any[]): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Relatório de Clientes', 14, 22);

    const head = [['ID', 'Razão Social', 'Vendedor']];
    const body = dados.map(c => [c.id, c.razaoSocial, c.nomeVendedor]);

    autoTable(doc, {
      startY: 30,
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
