import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';


@Component({
  selector: 'app-produtos-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent],
  templateUrl: './contas-pagar-relatorio.component.html',
  styleUrls: ['./contas-pagar-relatorio.component.scss']
})
export class ContasPagarRelatorioComponent implements OnInit {
  contasPagarRelatorioForm = new FormGroup({
    dataVencimentoInicio:    new FormControl<string | null>(null),
    dataVencimentoFinal:     new FormControl<string | null>(null),
    fornecedorId:        new FormControl<number | null>(null),
    fornecedorNome:      new FormControl<string | null>(null),
    tipoCobranca:        new FormControl<string | null>(null),
    formaPagamento:       new FormControl<string | null>(null),
    valorParcelaInicial: new FormControl<number | null>(null),
    valorParcelaFinal:   new FormControl<number | null>(null),
    status:              new FormControl<string | null>(null),

  });


  urlHome = '/gerencial';

  constructor(

  ) {}

  ngOnInit(): void {

  }

  onSubmit(): void {
    if (this.contasPagarRelatorioForm.invalid) {
      return;
    }

  }
}
