
import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { VendedoresService } from '../../services/vendedores.service';

@Component({
  selector: 'app-pedidos-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pedidos-relatorio.component.html',
  styleUrl: './pedidos-relatorio.component.scss'
})
export class PedidosRelatorioComponent {
  PedidosRelatorioForm = new FormGroup({
      dataInicio:   new FormControl<string | null>(null),
      dataFim:      new FormControl<string | null>(null),
      vendedorId:   new FormControl<number | null>(null),
      vendedorNome: new FormControl<string>(''),
      clienteId:    new FormControl<number | null>(null),
      clienteNome:  new FormControl<string>(''),
      tipoCobranca: new FormControl<string>(''),
      valorInicial: new FormControl<number | null>(null),
      valorFinal:   new FormControl<number | null>(null)
    });

    vendedores: any[] = [];
    showVendedoresList = false;
    vendedorInput = '';


    constructor(
      private vendedoresService: VendedoresService,
    ) {}

    onSearchVendedores(): void {
      const nome = this.PedidosRelatorioForm.value.vendedorNome?.trim() || '';
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
      this.PedidosRelatorioForm.patchValue({
        vendedorId:   v.id,
        vendedorNome: v.nome
      });
      this.vendedorInput = v.nome;
      this.showVendedoresList = false;
    }

    onSubmit(): void {
      if (this.PedidosRelatorioForm.invalid) {
        return;
      }
    }

}
