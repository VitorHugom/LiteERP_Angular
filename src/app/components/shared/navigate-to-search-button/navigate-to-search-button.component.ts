import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-navigate-to-search-button',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './navigate-to-search-button.component.html',
  styleUrl: './navigate-to-search-button.component.scss'
})
export class NavigateToSearchButtonComponent {
  @Input() routerLink: String = ''
}
