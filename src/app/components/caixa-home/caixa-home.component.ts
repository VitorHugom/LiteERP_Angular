import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-caixa-home',
  standalone: true,
  templateUrl: './caixa-home.component.html',
  styleUrls: ['./caixa-home.component.scss']
})
export class CaixaHomeComponent {

  constructor(private router: Router) {}

  logout(): void {
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  navigateTo(route: string): void {
    this.router.navigate([`/${route}`]);
  }
}
