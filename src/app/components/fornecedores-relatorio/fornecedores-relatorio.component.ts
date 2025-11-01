// src/app/components/fornecedores-relatorio/fornecedores-relatorio.component.ts

import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import {
  FornecedoresService,
  FornecedoresFiltro,
  FornecedoresRelatorioRow
} from '../../services/fornecedores.service';
import { CidadesService } from '../../services/cidades.service';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';

@Component({
  selector: 'app-fornecedores-relatorio',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NavigateToSearchButtonComponent
  ],
  templateUrl: './fornecedores-relatorio.component.html',
  styleUrls: ['./fornecedores-relatorio.component.scss']
})
export class FornecedoresRelatorioComponent {
  fornecedoresRelatorioForm = new FormGroup({
    dataInicio:   new FormControl<string | null>(null),
    dataFim:      new FormControl<string | null>(null),
    cidadeId:     new FormControl<number | null>(null),
    cidadeNome:   new FormControl<string>('')
  });

  cidades: any[] = [];
  showCidadesList = false;
  cidadeInput = '';

  urlHome = '/gerencial'; // ajuste conforme sua rota principal

  constructor(
    private fornecedoresService: FornecedoresService,
    private cidadesService: CidadesService
  ) {}

  onSearchCidades(): void {
    const nome = this.fornecedoresRelatorioForm.value.cidadeNome?.trim() || '';
    if (nome.length < 2) {
      this.cidades = [];
      this.showCidadesList = false;
      this.fornecedoresRelatorioForm.patchValue({ cidadeId: null });
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
    this.fornecedoresRelatorioForm.patchValue({
      cidadeId:   c.id,
      cidadeNome: c.nome
    });
    this.cidadeInput = c.nome;
    this.showCidadesList = false;
  }

  onSubmit(): void {
    if (this.fornecedoresRelatorioForm.invalid) {
      return;
    }

    // 1) Monta o filtro igual ao DTO do back-end
    const f = this.fornecedoresRelatorioForm.value;
    const filtro: FornecedoresFiltro = {
      dataCadastroInicial: f.dataInicio!,  // string no formato 'YYYY-MM-DD' ou null
      dataCadastroFinal:   f.dataFim!,
      cidadeId:            f.cidadeId!
    };

    // 2) Chama o serviço para obter todas as linhas completas
    this.fornecedoresService.gerarRelatorio(filtro)
      .subscribe(
        (dados: FornecedoresRelatorioRow[]) => {
          // 3) Gera o PDF a partir dos dados e do filtro
          const doc = this.gerarDoc(dados, filtro);
          this.abrirPdfEmNovaAba(doc);
        },
        err => console.error(err)
      );
  }

  // Converte 'YYYY-MM-DD' → 'DD/MM/YYYY'
  private formatarDataBR(dataIso: string | null): string {
    if (!dataIso) return '';
    const partes = dataIso.split('-');
    if (partes.length !== 3) return dataIso;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  /**
   * Prepara o documento jsPDF (paisagem) com título, filtros e tabela.
   * Escolhemos colunas que consideramos mais relevantes:
   *   ['ID', 'Razão Social', 'Nome Fantasia', 'CNPJ/CPF', 'Cidade', 'Telefone', 'Email', 'Data Cadastro']
   */
  private gerarDoc(
    dados: FornecedoresRelatorioRow[],
    filtro: FornecedoresFiltro
  ): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Relatório de Fornecedores', 14, 20);

    // Texto dos filtros usados
    doc.setFontSize(12);
    let yPosFilters = 28;
    doc.text('Filtros Aplicados:', 14, yPosFilters);
    yPosFilters += 6;

    if (filtro.dataCadastroInicial) {
      doc.text(
        `Cadastro a partir de: ${this.formatarDataBR(filtro.dataCadastroInicial)}`,
        14,
        yPosFilters
      );
      yPosFilters += 6;
    }
    if (filtro.dataCadastroFinal) {
      doc.text(
        `Cadastro até: ${this.formatarDataBR(filtro.dataCadastroFinal)}`,
        14,
        yPosFilters
      );
      yPosFilters += 6;
    }
    if (this.fornecedoresRelatorioForm.value.cidadeNome) {
      doc.text(
        `Cidade: ${this.fornecedoresRelatorioForm.value.cidadeNome}`,
        14,
        yPosFilters
      );
      yPosFilters += 6;
    }

    // Calcula a posição inicial da tabela
    const startY = yPosFilters + 4;

    // 4) Cabeçalho e corpo da tabela
    // Cabeçalho com as colunas escolhidas
    const head = [[
      'ID',
      'Razão Social',
      'Nome Fantasia',
      'CNPJ/CPF',
      'Cidade',
      'Telefone',
      'Email',
      'Data Cadastro'
    ]];

    // Corpo: transforma cada FornecedoresRelatorioRow em um array de células em ordem de colunas
    const body = dados.map((c: FornecedoresRelatorioRow) => {
      // Decide exibir CPF ou CNPJ: se for pessoa jurídica, exibe CNPJ, senão CPF
      const cnpjOuCpf = c.cnpj && c.cnpj.trim().length > 0
        ? c.cnpj
        : (c.cpf ?? '');

      // Nome da cidade (pode ser nulo)
      const cidadeNome = c.cidade ? c.cidade.nome : '';

      // Formata dataCadastro
      const dataCadBR = this.formatarDataCadastro(c.dataCadastro);

      return [
        c.id,
        c.razaoSocial,
        c.nomeFantasia ?? '',
        cnpjOuCpf,
        cidadeNome,
        c.telefone ?? '',
        c.email ?? '',
        dataCadBR
      ];
    });

    autoTable(doc, {
      startY,
      head,
      body,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [41, 128, 185] } // azul escuro para o header
    });

    return doc;
  }

  /**
   * Formata a data de cadastro que pode vir como array Java ou string
   */
  private formatarDataCadastro(dataCadastro: any): string {
    if (!dataCadastro) return '';

    // Se for array Java LocalDate [year, month, day]
    if (Array.isArray(dataCadastro) && dataCadastro.length >= 3) {
      const [year, month, day] = dataCadastro;
      const dataISO = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return this.formatarDataBR(dataISO);
    }

    // Se for string ISO
    if (typeof dataCadastro === 'string') {
      return this.formatarDataBR(dataCadastro);
    }

    return '';
  }

  private abrirPdfEmNovaAba(doc: jsPDF): void {
    const blob = doc.output('blob');
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}
