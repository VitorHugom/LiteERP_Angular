import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {

  @Input() text: string = 'Novo'
  @Input() color: string = 'novo-button'
  @Input() type: string = 'button'

  @Output() action = new EventEmitter<void>()

  onclick() {
    this.action.emit()
  }
}
