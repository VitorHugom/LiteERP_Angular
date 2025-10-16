import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecuperacaoSenhaService } from '../../services/recuperacao-senha.service';

@Component({
  selector: 'app-solicitar-recuperacao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './solicitar-recuperacao.component.html',
  styleUrls: ['./solicitar-recuperacao.component.scss']
})
export class SolicitarRecuperacaoComponent {
  nomeUsuario: string = '';
  loading: boolean = false;
  erro: string = '';

  constructor(
    private recuperacaoService: RecuperacaoSenhaService,
    private router: Router
  ) {}

  solicitarCodigo(): void {
    if (!this.nomeUsuario || this.nomeUsuario.trim() === '') {
      this.erro = 'Informe o nome de usuário';
      return;
    }

    this.loading = true;
    this.erro = '';

    this.recuperacaoService.solicitarRecuperacao(this.nomeUsuario.trim()).subscribe({
      next: (response) => {
        this.loading = false;
        
        // Armazenar dados para próxima tela
        this.recuperacaoService.salvarDadosTemporarios(
          this.nomeUsuario.trim(),
          response.emailMascarado,
          response.expiracaoMinutos
        );
        
        // Navegar para tela de validação
        this.router.navigate(['/recuperar-senha/validar']);
      },
      error: (err) => {
        this.loading = false;
        this.erro = err.error?.mensagem || err.error?.message || 'Erro ao solicitar recuperação de senha';
        console.error('Erro ao solicitar recuperação:', err);
      }
    });
  }

  voltarLogin(): void {
    this.router.navigate(['/login']);
  }
}

