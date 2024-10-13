import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-caixa',
  standalone: true,
  imports: [],
  templateUrl: './caixa.component.html',
  styleUrl: './caixa.component.scss'
})
export class CaixaComponent {
  constructor(private router: Router) {}

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}
