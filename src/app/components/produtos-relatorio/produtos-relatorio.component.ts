import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produtos-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './produtos-relatorio.component.html',
  styleUrl: './produtos-relatorio.component.scss'
})
export class ProdutosRelatorioComponent {
ProdutosRelatorioForm = new FormGroup({
    dataCompraInicio:   new FormControl<string | null>(null),
    dataCompraFinal:      new FormControl<string | null>(null),
    grupoProdutoId: new FormControl<number | null>(null),
    precoVendaInicio: new FormControl<number | null>(null),
    precoVendaFinal:  new FormControl<number | null>(null),
    precoCustoInicial: new FormControl<number | null>(null),
    precoCustoFinal:   new FormControl<number | null>(null),
    pesoInicial: new FormControl<number | null>(null),
    pesoFinal:   new FormControl<number | null>(null),
  });



  onSubmit(): void {
    if (this.ProdutosRelatorioForm.invalid) {
      return;
    }

  }

}
