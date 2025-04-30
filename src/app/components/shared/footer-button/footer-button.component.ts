import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonComponent } from '../button/button.component';
import { ButtonModel } from './button.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer-button',
  standalone: true,
  imports: [ButtonComponent, CommonModule],
  templateUrl: './footer-button.component.html',
  styleUrl: './footer-button.component.scss'
})
export class FooterButtonComponent {

  @Input() buttons: ButtonModel[] = []
  @Input() isNew: boolean = false

  @Output() action = new EventEmitter<string>()

  onClick(event: string) {
    this.action.emit(event)
  }

}
