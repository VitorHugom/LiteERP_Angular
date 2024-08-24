import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms'; // Importa o FormsModule

@Component({
  selector: 'app-login',
  standalone: true, // Indica que este é um componente standalone
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule] // Adiciona o FormsModule nas importações do componente
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  onSubmit(): void {
    // Aqui você pode adicionar a lógica de autenticação
    console.log('Username:', this.username);
    console.log('Password:', this.password);
  }
}
