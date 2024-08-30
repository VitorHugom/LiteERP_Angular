import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, CommonModule],
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
        sessionStorage.setItem('auth-token', response.token);
        sessionStorage.setItem('username', response.nome);

        const token = response.token;
        const decodedToken = this.decodeToken(token);
        const role = decodedToken?.role;

        if (role) {
          sessionStorage.setItem('user-role', role);
          console.log("Role extraída: " + role);

          // Redireciona o usuário com base na role
          switch (role) {
            case 'ROLE_GERENCIAL':
              this.router.navigate(['/gerencial-home']);
              break;
            case 'ROLE_VENDAS':
              this.router.navigate(['/vendas-home']);
              break;
            case 'ROLE_CAIXA':
              this.router.navigate(['/caixa-home']);
              break;
            default:
              this.errorMessage = 'Role não reconhecida.';
              break;
          }
        } else {
          console.error('Role não encontrada no token.');
          this.errorMessage = 'Erro ao autenticar. Role não encontrada.';
        }
      },
      error: (error) => {
        console.error('Erro de login:', error);
        this.errorMessage = 'Usuário ou senha incorretos. Tente novamente.';
      }
    });
  }

  private decodeToken(token: string): any {
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error('Erro ao decodificar o token:', error);
      return null;
    }
  }
}
