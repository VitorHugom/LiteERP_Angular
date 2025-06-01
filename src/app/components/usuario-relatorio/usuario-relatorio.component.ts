import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavigateToSearchButtonComponent } from '../shared/navigate-to-search-button/navigate-to-search-button.component';



@Component({
  selector: 'app-estoque-relatorio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavigateToSearchButtonComponent],
  templateUrl: 'usuario-relatorio.component.html',
  styleUrls: ['usuario-relatorio.component.scss']
})
export class UsuarioRelatorioComponent implements OnInit {
  usuarioRelatorioForm = new FormGroup({
    categoriaId:      new FormControl<number | null>(null),

  });

  urlHome = '/gerencial';


  ngOnInit(): void {

  }

  onSubmit(): void {
    if (this.usuarioRelatorioForm.invalid) {
      return;
    }

  }

}
