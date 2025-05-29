import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-clientes-relatorio',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './clientes-relatorio.component.html',
  styleUrl: './clientes-relatorio.component.scss'
})
export class ClientesRelatorioComponent {

  clientesRelatorioForm: FormGroup = new FormGroup({
    dataInicio: new FormControl(''),
    dataFim: new FormControl(''),
    vedendor: new FormControl(''),
    cidade: new FormControl(''),
  })
}
