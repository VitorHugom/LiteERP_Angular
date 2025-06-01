import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FornecedoresFiltro {
  dataCadastroInicial: string | null;
  dataCadastroFinal:   string | null;
  cidadeId:            number | null;
}

export interface FornecedoresRelatorioRow {
  id:                     number;
  tipoPessoa:             string;
  cpf:                    string | null;
  cnpj:                   string | null;
  nomeFantasia:           string | null;
  razaoSocial:            string;
  cidade: {
    id:   number;
    nome: string;
  } | null;
  telefone:               string | null;
  email:                  string | null;
  dataCadastro:           string;
}

@Injectable({
  providedIn: 'root'
})
export class FornecedoresService {
  private baseUrl = environment.apiUrl + '/fornecedores';
  private viacepUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  getFornecedores(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getFornecedorById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getFornecedorByIdBusca(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/busca/${id}`);
  }

  createFornecedor(fornecedor: any): Observable<any> {
    return this.http.post(this.baseUrl, fornecedor);
  }

  updateFornecedor(id: string, fornecedor: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, fornecedor);
  }

  deleteFornecedor(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getEnderecoByCep(cep: string): Observable<any> {
    return this.http.get(`${this.viacepUrl}/${cep}/json`);
  }

  getCidadeByCodigoIbge(codigoIbge: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/cidades/codigoIbge/${codigoIbge}`);
  }

  searchFornecedores(nomeFantasia: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('nomeFantasia', nomeFantasia)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }

  getFornecedoresByRazaoSocialBusca(razaoSocial: string, page: number = 0): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('razaoSocial', razaoSocial);
    return this.http.get(`${this.baseUrl}/busca-por-razao-social`, { params });
  }

  getFornecedoresBusca(page: number = 0): Observable<any> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get(`${this.baseUrl}/busca`, { params });
  }

  gerarRelatorio(filtro: FornecedoresFiltro): Observable<FornecedoresRelatorioRow[]> {
    return this.http.post<FornecedoresRelatorioRow[]>(`${this.baseUrl}/relatorios`, filtro);
  }
}
