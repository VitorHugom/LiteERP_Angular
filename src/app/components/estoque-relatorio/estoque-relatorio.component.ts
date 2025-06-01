import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GrupoProdutosService } from '../../services/grupo-produtos.service';
import { EstoqueService, EstoqueFiltro } from '../../services/estoque.service';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-estoque-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent],
  templateUrl: './estoque-relatorio.component.html',
  styleUrls: ['./estoque-relatorio.component.scss']
})
export class EstoqueRelatorioComponent implements OnInit {
  estoqueRelatorioForm = new FormGroup({
    grupoProdutoId: new FormControl<number | null>(null)
  });

  grupos: any[] = [];
  urlHome = '/gerencial';

  constructor(
    private grupoProdutosService: GrupoProdutosService,
    private estoqueService: EstoqueService
  ) {}

  ngOnInit(): void {
    this.grupoProdutosService.getGruposProdutos()
      .subscribe(list => {
        this.grupos = list;
      });
  }

  onSubmit(): void {
    if (this.estoqueRelatorioForm.invalid) {
      return;
    }

    const f = this.estoqueRelatorioForm.value;
    const filtro: EstoqueFiltro = {
      grupoId: f.grupoProdutoId ?? undefined
    };

    this.estoqueService.gerarRelatorio(filtro)
      .subscribe(
        data => {
          const doc = this.gerarPdf(data, filtro);
          this.abrirPdfEmNovaAba(doc);
        },
        err => console.error(err)
      );
  }

  private gerarPdf(dados: any[], filtro: EstoqueFiltro): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Relatório de Estoque', 14, 20);

    doc.setFontSize(12);
    let yPosFilters = 28;
    doc.text('Filtros Aplicados:', 14, yPosFilters);
    yPosFilters += 6;

    if (filtro.grupoId) {
      const grp = this.grupos.find(g => g.id === filtro.grupoId);
      if (grp) {
        doc.text(`Grupo: ${grp.nome}`, 14, yPosFilters);
        yPosFilters += 6;
      }
    }

    const startY = yPosFilters + 4;
    const head = [['ID Estoque', 'ID Produto', 'Nome Produto', 'Qtd. Estoque']];

    const body = dados.map(e => {
      const qtd = (typeof e.qtdEstoque === 'number')
        ? e.qtdEstoque.toFixed(3)
        : e.qtdEstoque ?? '';
      return [
        e.id,
        e.idProduto,
        e.nomeProduto,
        qtd
      ];
    });

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
