import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ContaCaixa {
  id: number;
  descricao: string;
  tipo: string;
  banco: string | null;
  agencia: string | null;
  conta: string | null;
  saldoAtual: number;
  usuarioResponsavelId: number;
  usuarioResponsavelNome: string;
  ativo: boolean;
  dataCriacao: string;
}

@Injectable({
  providedIn: 'root'
})
export class FluxoCaixaService {
  private baseUrl = 'http://localhost:8080/fluxo-caixa';

  constructor(private http: HttpClient) { }

  getContas(): Observable<ContaCaixa[]> {
    return this.http.get<ContaCaixa[]>(`${this.baseUrl}/contas`);
  }
}
