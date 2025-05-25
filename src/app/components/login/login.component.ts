import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [FormsModule, CommonModule,ReactiveFormsModule],
  providers: [LoginService]
})
export class LoginComponent {

  profileForm = new FormGroup({
    username: new FormControl('', [Validators.required, Validators.minLength(3)]),
    password: new FormControl('', [Validators.required, Validators.minLength(3)])
  })

  errorMessage: string = ''
  isError: boolean = false



  constructor(private loginService: LoginService, private router: Router) {}


  onSubmit(): void {
    this.profileForm.markAllAsTouched();

    if (this.profileForm.valid) {
      const { username, password } = this.profileForm.value;

      const credentials = {
        nomeUsuario: String(username),
        senha: String(password),
      };

      this.loginService.login(credentials).subscribe({
        next: (response) => {
          sessionStorage.setItem('auth-token', response.token);
          sessionStorage.setItem('username', response.nome);

          const token = response.token;
          const decodedToken = this.decodeToken(token);
          const role = decodedToken?.role;
          const userId = decodedToken?.userId;

          const expirationDate = decodedToken.exp * 1000; // exp está em segundos, então converta para ms
          sessionStorage.setItem('token-expiration', expirationDate.toString());

          sessionStorage.setItem('userId', userId);

          if (role) {
            sessionStorage.setItem('user-role', role);
            console.log('Role extraída: ' + role);

            // Redireciona o usuário com base na role
            switch (role) {
              case 'ROLE_GERENCIAL':
                this.router.navigate(['/gerencial']);
                break;
              case 'ROLE_VENDAS':
                this.router.navigate(['/vendas']);
                break;
              case 'ROLE_CAIXA':
                this.router.navigate(['/caixa']);
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

          // Tratar erros com base no status HTTP retornado pela API
          switch (error.status) {
            case 404:
              this.errorMessage = 'Usuário não encontrado.';
              break;
            case 403:
              this.errorMessage = 'Usuário não autorizado.';
              break;
            case 401:
              this.errorMessage = 'Senha incorreta.';
              break;
            default:
              this.errorMessage = 'Erro ao realizar login. Tente novamente.';
              break;
          }

          this.isError = true;
        },
      });
    }
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
