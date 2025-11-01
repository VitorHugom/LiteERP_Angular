import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ContasPagarFiltro {
  dataVencimentoInicio?: string;
  dataVencimentoFim?: string;
  idFornecedor?: number;
  idTipoCobranca?: number;
  idFormaPagamento?: number;
  valorTotalInicial?: number;
  valorTotalFinal?: number;
}

export interface ContasPagarResponse {
  id: number;
  numeroDocumento: string;
  parcela: number;
  valorParcela: number;
  valorTotal: number;
  dataVencimento: string;
  status: string;
  fornecedor: {
    id: number;
    razaoSocial: string;
  };
  formaPagamento: {
    id: number;
    descricao: string;
  };
  tipoCobranca: {
    id: number;
    descricao: string;
  };
}

export interface ContasPagarGraficoItem {
  dataVencimento: string;
  valorTotalParcelas: number;
  qtdParcelas: number;
  idsParcelas: number[];
}

export interface ContasPagarGraficoResponse {
  content: ContasPagarGraficoItem[];
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
export class ContasPagarService {
  private baseUrl = environment.apiUrl + '/contas-pagar';

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
   * Converte as datas de uma conta a pagar
   */
  private convertContaDates(conta: any): any {
    if (!conta) return conta;

    return {
      ...conta,
      dataVencimento: this.convertJavaLocalDateToISO(conta.dataVencimento)
    };
  }

  getContasPagar(page: number = 0): Observable<any> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get(`${this.baseUrl}/buscar`, { params });
  }

  getContaPagarById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`).pipe(
      map(conta => this.convertContaDates(conta))
    );
  }

  createContaPagar(contaPagar: any): Observable<any> {
    return this.http.post(this.baseUrl, contaPagar).pipe(
      map(response => this.convertContaDates(response))
    );
  }

  updateContaPagar(id: number, contaPagar: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, contaPagar).pipe(
      map(response => this.convertContaDates(response))
    );
  }

  deleteContaPagar(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  buscarContasPagarPorFiltro(
    razaoSocial: string, 
    dataInicio: string, 
    dataFim: string, 
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

  gerarRelatorio(filtro: ContasPagarFiltro): Observable<ContasPagarResponse[]> {
    return this.http.post<ContasPagarResponse[]>(`${this.baseUrl}/relatorios`, filtro);
  }

  getRelatorioGrafico(
    dataInicio: string,
    dataFim: string,
    status: string = 'aberta',
    page: number = 0,
    size: number = 10,
    sort: string = 'dataVencimento,asc'
  ): Observable<ContasPagarGraficoResponse> {
    let params = new HttpParams()
      .set('dataInicio', dataInicio)
      .set('dataFim', dataFim)
      .set('status', status)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get<ContasPagarGraficoResponse>(`${this.baseUrl}/relatorio-grafico`, { params });
  }

  buscarContasPagarPorFornecedor(
    idFornecedor: number,
    page: number = 0,
    size: number = 10,
    sort: string = 'dataVencimento,asc'
  ): Observable<any> {
    let params = new HttpParams()
      .set('idFornecedor', idFornecedor.toString())
      .set('somentePagar', 'true')
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', sort);

    return this.http.get(`${this.baseUrl}/buscar`, { params });
  }

  realizarPagamentoConta(idConta: number): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${idConta}/pagar`, {});
  }
}
