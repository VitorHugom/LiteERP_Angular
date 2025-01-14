import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContasPagarService {
  private baseUrl = environment.apiUrl + '/contas-pagar';

  constructor(private http: HttpClient) {}

  getContasPagar(page: number = 0): Observable<any> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get(`${this.baseUrl}/buscar`, { params });
  }

  getContaPagarById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createContaPagar(contaPagar: any): Observable<any> {
    return this.http.post(this.baseUrl, contaPagar);
  }

  updateContaPagar(id: number, contaPagar: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, contaPagar);
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
}
