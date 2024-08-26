import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, CommonModule, HttpClientModule],
  providers: [LoginService]
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  errorMessage: string = '';

  constructor(private loginService: LoginService, private router: Router) {}

  onSubmit(): void {
    const credentials = {
      nomeUsuario: this.username,
      senha: this.password
    };

    this.loginService.login(credentials).subscribe({
      next: (response) => {
        // Salva o token e o nome no sessionStorage
        sessionStorage.setItem('auth-token', response.token);
        sessionStorage.setItem('username', response.nome);

        this.router.navigate(['/gerencial-home']);
      },
      error: (error) => {
        console.error('Erro de login:', error);
        this.errorMessage = 'Usuário ou senha incorretos. Tente novamente.';
      }
    });
  }
}
