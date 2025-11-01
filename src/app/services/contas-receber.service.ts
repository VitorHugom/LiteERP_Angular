import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ContasReceberFiltro {
  dataRecebimentoInicio?: string;
  dataRecebimentoFim?: string;
  idCliente?: number;
  idTipoCobranca?: number;
  idFormaPagamento?: number;
  valorTotalInicial?: number;
  valorTotalFinal?: number;
}

export interface ContasReceberResponse {
  id: number;
  cliente: {
    id: number;
    razaoSocial: string;
  };
  numeroDocumento: string;
  parcela: number;
  valorParcela: number;
  valorTotal: number;
  formaPagamento: {
    id: number;
    descricao: string;
  };
  tipoCobranca: {
    id: number;
    descricao: string;
  };
  dataVencimento: string;
  status: string;
}

export interface ContasReceberGraficoItem {
  dataVencimento: string;
  valorTotalParcelas: number;
  qtdParcelas: number;
  idsParcelas: number[];
}

export interface ContasReceberGraficoResponse {
  content: ContasReceberGraficoItem[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      unsorted: boolean;
      sorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    unsorted: boolean;
    sorted: boolean;
  };
  numberOfElements: number;
  first: boolean;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ContasReceberService {
  private baseUrl = `${environment.apiUrl}/contas-receber`;

  constructor(private http: HttpClient) {}

  /**
   * Converte array Java LocalDate para string ISO (YYYY-MM-DD)
   */
  private convertJavaLocalDateToISO(javaDate: any): string | null {
    if (!javaDate) return null;

    // Se for array Java LocalDate [year, month, day]
    if (Array.isArray(javaDate) && javaDate.length >= 3) {
      const [year, month, day] = javaDate;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Se já for string, retorna como está
    return javaDate;
  }

  /**
   * Converte as datas de uma conta a receber
   */
  private convertContaDates(conta: any): any {
    if (!conta) return conta;

    return {
      ...conta,
      dataVencimento: this.convertJavaLocalDateToISO(conta.dataVencimento)
    };
  }

  getContasReceber(page: number = 0): Observable<any> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get(`${this.baseUrl}/buscar`, { params });
  }

  getContaReceberById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`).pipe(
      map(conta => this.convertContaDates(conta))
    );
  }

  createContaReceber(contaReceber: any): Observable<any> {
    return this.http.post(this.baseUrl, contaReceber).pipe(
      map(response => this.convertContaDates(response))
    );
  }

  updateContaReceber(id: number, contaReceber: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, contaReceber).pipe(
      map(response => this.convertContaDates(response))
    );
  }

  deleteContaReceber(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  buscarContasReceberPorFiltro(
    razaoSocial?: string,
    dataInicio?: string,
    dataFim?: string,
    page: number = 0
  ): Observable<any> {
    let params = new HttpParams().set('page', page.toString());

    if (razaoSocial) {
      params = params.set('razaoSocial', razaoSocial);
    }
    if (dataInicio) {
      params = params.set('dataInicio', dataInicio);
    }
    if (dataFim) {
      params = params.set('dataFim', dataFim);
    }

    return this.http.get(`${this.baseUrl}/buscar`, { params });
  }

  gerarRelatorio(filtro: ContasReceberFiltro): Observable<ContasReceberResponse[]> {
    return this.http.post<ContasReceberResponse[]>(`${this.baseUrl}/relatorios`, filtro);
  }

  buscarContasReceberPorCliente(
    idCliente: number,
    page: number = 0,
    size: number = 10,
    sort: string = 'dataVencimento,asc'
  ): Observable<any> {
    let params = new HttpParams()
      .set('idCliente', idCliente.toString())
      .set('somenteReceber', 'true')
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get(`${this.baseUrl}/buscar`, { params });
  }

  realizarRecebimentoConta(idConta: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${idConta}/receber`, {});
  }

  gerarContaPorPedido(payload: { idPedido: number; idFormaPagamento: number; idTipoCobranca: number }): Observable<any> {
    return this.http.post(`${this.baseUrl}/gerar-por-pedido`, payload);
  }

  getRelatorioGrafico(
    dataInicio: string,
    dataFim: string,
    status: string = 'aberta',
    page: number = 0,
    size: number = 10,
    sort: string = 'dataVencimento,asc'
  ): Observable<ContasReceberGraficoResponse> {
    let params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim)
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ContasReceberGraficoResponse>(`${this.baseUrl}/relatorio-grafico`, { params });
  }
}