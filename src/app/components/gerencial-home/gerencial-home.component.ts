import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-gerencial-home',
  standalone: true,
  templateUrl: './gerencial-home.component.html',
  styleUrls: ['./gerencial-home.component.scss'],
  imports: [CommonModule]
})
export class GerencialHomeComponent {

  constructor(private router: Router) {}

  logout(): void {
    sessionStorage.clear(); // Limpa o sessionStorage
    this.router.navigate(['/login']); // Redireciona para a página de login
  }
}
