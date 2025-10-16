import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface SolicitarRecuperacaoRequest {
  nomeUsuario: string;
}

export interface SolicitarRecuperacaoResponse {
  mensagem: string;
  emailMascarado: string;
  expiracaoMinutos: number;
}

export interface ValidarCodigoRequest {
  nomeUsuario: string;
  codigo: string;
}

export interface ValidarCodigoResponse {
  mensagem: string;
  token: string;
}

export interface RedefinirSenhaRequest {
  token: string;
  novaSenha: string;
}

export interface RedefinirSenhaResponse {
  mensagem: string;
}

@Injectable({
  providedIn: 'root'
})
export class RecuperacaoSenhaService {
  private apiUrl = `${environment.apiUrl}/auth/recuperar-senha`;

  constructor(private http: HttpClient) {}

  solicitarRecuperacao(nomeUsuario: string): Observable<SolicitarRecuperacaoResponse> {
    return this.http.post<SolicitarRecuperacaoResponse>(
      `${this.apiUrl}/solicitar`,
      { nomeUsuario }
    );
  }

  validarCodigo(nomeUsuario: string, codigo: string): Observable<ValidarCodigoResponse> {
    return this.http.post<ValidarCodigoResponse>(
      `${this.apiUrl}/validar-codigo`,
      { nomeUsuario, codigo }
    );
  }

  redefinirSenha(token: string, novaSenha: string): Observable<RedefinirSenhaResponse> {
    return this.http.post<RedefinirSenhaResponse>(
      `${this.apiUrl}/redefinir`,
      { token, novaSenha }
    );
  }

  // Armazenar token temporário
  salvarToken(token: string): void {
    sessionStorage.setItem('recuperacao_token', token);
  }

  // Recuperar token temporário
  obterToken(): string | null {
    return sessionStorage.getItem('recuperacao_token');
  }

  // Limpar token
  limparToken(): void {
    sessionStorage.removeItem('recuperacao_token');
  }

  // Armazenar dados temporários
  salvarDadosTemporarios(usuario: string, email: string, expiracao: number): void {
    sessionStorage.setItem('recuperacao_usuario', usuario);
    sessionStorage.setItem('recuperacao_email', email);
    sessionStorage.setItem('recuperacao_expiracao', expiracao.toString());
  }

  // Recuperar dados temporários
  obterDadosTemporarios(): { usuario: string; email: string; expiracao: number } | null {
    const usuario = sessionStorage.getItem('recuperacao_usuario');
    const email = sessionStorage.getItem('recuperacao_email');
    const expiracao = sessionStorage.getItem('recuperacao_expiracao');

    if (!usuario || !email || !expiracao) {
      return null;
    }

    return {
      usuario,
      email,
      expiracao: parseInt(expiracao)
    };
  }

  // Limpar todos os dados temporários
  limparDadosTemporarios(): void {
    sessionStorage.removeItem('recuperacao_usuario');
    sessionStorage.removeItem('recuperacao_email');
    sessionStorage.removeItem('recuperacao_expiracao');
    this.limparToken();
  }
}

