import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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

// Interface para movimenta??o individual
export interface MovimentacaoFluxoCaixa {
  id: number;
  contaCaixaId: number;
  contaCaixaDescricao: string;
  tipoMovimentacaoId: number;
  tipoMovimentacaoDescricao: string;
  categoria: 'RECEITA' | 'DESPESA';
  corHex: string;
  centroCustoId: number | null;
  centroCustoDescricao: string | null;
  tipoOrigem: string;
  referenciaId: number;
  numeroDocumento: string;
  descricao: string;
  valor: number;
  dataMovimentacao: string;
  dataLancamento: string;
  usuarioLancamentoId: number;
  usuarioLancamentoNome: string;
  observacoes: string;
  status: string;
}

// Interface para resposta paginada da API
export interface MovimentacaoFluxoCaixaResponse {
  content: MovimentacaoFluxoCaixa[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    unpaged: boolean;
    paged: boolean;
  };
  last: boolean;
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class FluxoCaixaService {
  private baseUrl = `${environment.apiUrl}/fluxo-caixa`;

  constructor(private http: HttpClient) { }

  getContas(): Observable<ContaCaixa[]> {
    return this.http.get<ContaCaixa[]>(`${this.baseUrl}/contas`);
  }

  getMovimentacoesPorConta(
    contaId: number,
    dataInicio: string,
    dataFim: string,
    page: number = 0,
    size: number = 1000,
    sort: string = 'dataMovimentacao,desc'
  ): Observable<MovimentacaoFluxoCaixaResponse> {
    let params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<MovimentacaoFluxoCaixaResponse>(`${this.baseUrl}/movimentacoes/conta/${contaId}`, { params });
  }

  getSaldoAnterior(contaId: number, dataReferencia: string): Observable<{saldo: number}> {
    let params = new HttpParams()
      .set('dataReferencia', dataReferencia);

    return this.http.get<{saldo: number}>(`${this.baseUrl}/saldo-anterior/conta/${contaId}`, { params });
  }
}
