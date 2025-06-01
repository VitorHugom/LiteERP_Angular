import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GrupoProdutosService } from '../../services/grupo-produtos.service';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';



@Component({
  selector: 'app-estoque-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent],
  templateUrl: 'estoque-relatorio.component.html',
  styleUrls: ['estoque-relatorio.component.scss']
})
export class EstoqueRelatorioComponent implements OnInit {
  estoqueRelatorioForm = new FormGroup({
    grupoProdutoId:      new FormControl<number | null>(null),

  });

  grupos: any[] = [];

  urlHome = '/gerencial';

  constructor(
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
    if (this.estoqueRelatorioForm.invalid) {
      return;
    }


  }

}
