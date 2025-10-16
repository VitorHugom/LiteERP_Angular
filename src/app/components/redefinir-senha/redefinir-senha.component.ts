import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecuperacaoSenhaService } from '../../services/recuperacao-senha.service';

@Component({
  selector: 'app-redefinir-senha',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './redefinir-senha.component.html',
  styleUrls: ['./redefinir-senha.component.scss']
})
export class RedefinirSenhaComponent implements OnInit {
  novaSenha: string = '';
  confirmarSenha: string = '';
  loading: boolean = false;
  erro: string = '';
  sucesso: boolean = false;
  mostrarSenha: boolean = false;
  mostrarConfirmarSenha: boolean = false;

  constructor(
    private recuperacaoService: RecuperacaoSenhaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Verificar se tem token
    const token = this.recuperacaoService.obterToken();
    if (!token) {
      this.router.navigate(['/recuperar-senha']);
    }
  }

  get senhaValida(): boolean {
    return this.novaSenha.length >= 6;
  }

  get senhasConferem(): boolean {
    return this.novaSenha === this.confirmarSenha && this.confirmarSenha.length > 0;
  }

  toggleMostrarSenha(): void {
    this.mostrarSenha = !this.mostrarSenha;
  }

  toggleMostrarConfirmarSenha(): void {
    this.mostrarConfirmarSenha = !this.mostrarConfirmarSenha;
  }

  redefinirSenha(): void {
    // Validações
    if (!this.novaSenha || this.novaSenha.length < 6) {
      this.erro = 'Senha deve ter no mínimo 6 caracteres';
      return;
    }

    if (this.novaSenha !== this.confirmarSenha) {
      this.erro = 'As senhas não coincidem';
      return;
    }

    const token = this.recuperacaoService.obterToken();
    if (!token) {
      this.erro = 'Token inválido. Solicite um novo código.';
      return;
    }

    this.loading = true;
    this.erro = '';

    this.recuperacaoService.redefinirSenha(token, this.novaSenha).subscribe({
      next: (response) => {
        this.loading = false;
        this.sucesso = true;
        
        // Limpar dados
        this.recuperacaoService.limparDadosTemporarios();
        
        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
      },
      error: (err) => {
        this.loading = false;
        this.erro = err.error?.mensagem || err.error?.message || 'Erro ao redefinir senha';
        console.error('Erro ao redefinir senha:', err);
      }
    });
  }
}

