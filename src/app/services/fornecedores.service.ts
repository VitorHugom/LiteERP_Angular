import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FornecedoresService {
  private baseUrl = 'http://localhost:8080/fornecedores';
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
    return this.http.get(`http://localhost:8080/cidades/codigoIbge/${codigoIbge}`);
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
}
