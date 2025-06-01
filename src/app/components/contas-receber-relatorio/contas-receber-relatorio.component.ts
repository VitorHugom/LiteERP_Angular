import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';


@Component({
  selector: 'app-produtos-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent],
  templateUrl: './contas-receber-relatorio.component.html',
  styleUrls: ['./contas-receber-relatorio.component.scss']
})
export class ContasReceberRelatorioComponent implements OnInit {
  contasPagarRelatorioForm = new FormGroup({
    dataRecebimentoInicio:    new FormControl<string | null>(null),
    dataRecebimentoFinal:     new FormControl<string | null>(null),
    fornecedorId:        new FormControl<number | null>(null),
    fornecedorNome:      new FormControl<string | null>(null),
    tipoCobranca:        new FormControl<string | null>(null),
    formaPagamento:       new FormControl<string | null>(null),
    valorTotalInicial: new FormControl<number | null>(null),
    valorTotalFinal:   new FormControl<number | null>(null),

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
