import { Component, Input } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { getHomeRouteByUserRole } from '../../../utils/navigation.utils';

@Component({
  selector: 'app-navigate-to-search-button',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './navigate-to-search-button.component.html',
  styleUrl: './navigate-to-search-button.component.scss'
})
export class NavigateToSearchButtonComponent {
  @Input() routerLink: String = '';
  @Input() useHomeNavigation: boolean = false; // Nova propriedade para usar navegação dinâmica para home

  constructor(private router: Router) {}

  onClick(): void {
    if (this.useHomeNavigation) {
      const homeRoute = getHomeRouteByUserRole();
      this.router.navigate([homeRoute]);
    }
    // Se não usar navegação home, o routerLink do template será usado
  }
}
