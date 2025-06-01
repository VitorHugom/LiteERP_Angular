import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
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

@Injectable({
  providedIn: 'root'
})
export class ContasReceberService {
  private baseUrl = `${environment.apiUrl}/contas-receber`;

  constructor(private http: HttpClient) {}

  getContasReceber(page: number = 0): Observable<any> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get(`${this.baseUrl}/buscar`, { params });
  }

  getContaReceberById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createContaReceber(contaReceber: any): Observable<any> {
    return this.http.post(this.baseUrl, contaReceber);
  }

  updateContaReceber(id: number, contaReceber: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, contaReceber);
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
}