import { Component } from '@angular/core';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { ConteudoComponent } from './components/conteudo/conteudo.component';
@Component({
  selector: 'app-gerencial',
  standalone: true,
  imports: [SidebarComponent,TopbarComponent,ConteudoComponent],
  templateUrl: './gerencial.component.html',
  styleUrl: './gerencial.component.scss'
})
export class GerencialComponent {

}
