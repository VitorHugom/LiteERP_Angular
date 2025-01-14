import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TiposCobrancaService {
  private baseUrl = environment.apiUrl + '/tipos_cobranca';  // Endereço base para os tipos de cobrança

  constructor(private http: HttpClient) {}

  // Método para obter todos os tipos de cobrança
  getTiposCobranca(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  // Método para obter um tipo de cobrança por ID
  getTipoCobrancaById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // Método para criar um novo tipo de cobrança
  createTipoCobranca(tipoCobranca: any): Observable<any> {
    return this.http.post(this.baseUrl, tipoCobranca);
  }

  // Método para atualizar um tipo de cobrança existente
  updateTipoCobranca(id: string, tipoCobranca: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, tipoCobranca);
  }

  // Método para deletar um tipo de cobrança
  deleteTipoCobranca(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
