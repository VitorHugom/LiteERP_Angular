import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecuperacaoSenhaService } from '../../services/recuperacao-senha.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-validar-codigo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validar-codigo.component.html',
  styleUrls: ['./validar-codigo.component.scss']
})
export class ValidarCodigoComponent implements OnInit, OnDestroy {
  nomeUsuario: string = '';
  emailMascarado: string = '';
  codigo: string = '';
  loading: boolean = false;
  erro: string = '';
  
  // Contador regressivo
  tempoRestante: number = 0;
  private timerSubscription?: Subscription;

  constructor(
    private recuperacaoService: RecuperacaoSenhaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Recuperar dados da tela anterior
    const dados = this.recuperacaoService.obterDadosTemporarios();
    
    if (!dados) {
      this.router.navigate(['/recuperar-senha']);
      return;
    }

    this.nomeUsuario = dados.usuario;
    this.emailMascarado = dados.email;
    
    // Iniciar contador regressivo
    this.tempoRestante = dados.expiracao * 60; // Converter para segundos
    this.iniciarContador();
  }

  ngOnDestroy(): void {
    this.timerSubscription?.unsubscribe();
  }

  iniciarContador(): void {
    this.timerSubscription = interval(1000).subscribe(() => {
      this.tempoRestante--;
      if (this.tempoRestante <= 0) {
        this.timerSubscription?.unsubscribe();
      }
    });
  }

  get tempoFormatado(): string {
    const minutos = Math.floor(this.tempoRestante / 60);
    const segundos = this.tempoRestante % 60;
    return `${minutos}:${segundos.toString().padStart(2, '0')}`;
  }

  get tempoExpirado(): boolean {
    return this.tempoRestante <= 0;
  }

  get progressoTempo(): number {
    const dados = this.recuperacaoService.obterDadosTemporarios();
    if (!dados) return 0;
    const tempoTotal = dados.expiracao * 60;
    return (this.tempoRestante / tempoTotal) * 100;
  }

  onCodigoInput(event: any): void {
    // Permitir apenas números
    const valor = event.target.value.replace(/\D/g, '');
    this.codigo = valor.substring(0, 6); // Limitar a 6 dígitos
  }

  validarCodigo(): void {
    if (!this.codigo || this.codigo.length !== 6) {
      this.erro = 'Código deve ter 6 dígitos';
      return;
    }

    if (this.tempoExpirado) {
      this.erro = 'Código expirado. Solicite um novo código.';
      return;
    }

    this.loading = true;
    this.erro = '';

    this.recuperacaoService.validarCodigo(this.nomeUsuario, this.codigo).subscribe({
      next: (response) => {
        this.loading = false;
        // Salvar token
        this.recuperacaoService.salvarToken(response.token);
        // Navegar para tela de redefinição
        this.router.navigate(['/recuperar-senha/redefinir']);
      },
      error: (err) => {
        this.loading = false;
        this.erro = err.error?.mensagem || err.error?.message || 'Código inválido';
        console.error('Erro ao validar código:', err);
      }
    });
  }

  reenviarCodigo(): void {
    this.recuperacaoService.limparDadosTemporarios();
    this.router.navigate(['/recuperar-senha']);
  }
}

