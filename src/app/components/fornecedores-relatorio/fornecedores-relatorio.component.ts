
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CidadesService } from '../../services/cidades.service';

@Component({
  selector: 'app-fornecedores-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fornecedores-relatorio.component.html',
  styleUrl: './fornecedores-relatorio.component.scss'
})
export class FornecedoresRelatorioComponent {
  fornecedoresRelatorioForm = new FormGroup({
      dataInicio:   new FormControl<string | null>(null),
      dataFim:      new FormControl<string | null>(null),
      fornecedorId:   new FormControl<number | null>(null),
      fornecedorNome: new FormControl<string>(''),
      cidadeId:     new FormControl<number | null>(null),
      cidadeNome:   new FormControl<string>('')
    });


    cidades: any[] = [];
    showCidadesList = false;
    cidadeInput = '';

    constructor(
      private cidadesService: CidadesService
    ) {}


    onSearchCidades(): void {
      const nome = this.fornecedoresRelatorioForm.value.cidadeNome?.trim() || '';
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

    }

}
