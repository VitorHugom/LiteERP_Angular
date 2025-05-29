import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

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
}