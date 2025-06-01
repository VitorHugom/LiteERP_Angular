import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';
import { UsuarioService, CategoriaUsuario, UsuarioFiltro, UsuarioResponse } from '../../services/usuario.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-usuario-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent],
  templateUrl: './usuario-relatorio.component.html',
  styleUrls: ['./usuario-relatorio.component.scss']
})
export class UsuarioRelatorioComponent implements OnInit {
  usuarioRelatorioForm = new FormGroup({
    categoriaId: new FormControl<number | null>(null)
  });

  categorias: CategoriaUsuario[] = [];
  urlHome = '/gerencial';

  constructor(private usuarioService: UsuarioService) {}

  ngOnInit(): void {
    this.usuarioService.getCategorias()
      .subscribe(list => {
        this.categorias = list;
      });
  }

  onSubmit(): void {
    if (this.usuarioRelatorioForm.invalid) {
      return;
    }

    const f = this.usuarioRelatorioForm.value;
    const filtro: UsuarioFiltro = {
      categoriaId: f.categoriaId ?? undefined
    };

    this.usuarioService.gerarRelatorio(filtro)
      .subscribe(
        data => {
          const doc = this.gerarPdf(data, filtro);
          this.abrirPdfEmNovaAba(doc);
        },
        err => console.error(err)
      );
  }

  private gerarPdf(dados: UsuarioResponse[], filtro: UsuarioFiltro): jsPDF {
    const doc = new jsPDF({ orientation: 'landscape' });
    doc.setFontSize(18);
    doc.text('Relatório de Usuário', 14, 20);

    doc.setFontSize(12);
    let yPosFilters = 28;
    doc.text('Filtros Aplicados:', 14, yPosFilters);
    yPosFilters += 6;

    if (filtro.categoriaId) {
      const cat = this.categorias.find(c => c.idCategoria === filtro.categoriaId);
      if (cat) {
        doc.text(`Categoria: ${cat.descricaoCategoria}`, 14, yPosFilters);
        yPosFilters += 6;
      }
    }

    const startY = yPosFilters + 4;
    const head = [['ID', 'Nome Usuário', 'Email', 'Status', 'Categoria', 'Telefone']];

    const body = dados.map(e => [
      e.id,
      e.nomeUsuario,
      e.email,
      e.status,
      e.categoria,
      e.telefone
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

  private abrirPdfEmNovaAba(doc: jsPDF): void {
    const blob = doc.output('blob');
    const url  = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}