import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RecebimentoMercadoriasService {
  private baseUrl = 'http://localhost:8080/recebimento_mercadorias';

  constructor(private http: HttpClient) {}

  // Listar todos os recebimentos
  getRecebimentos(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  // Buscar recebimento por ID
  getRecebimentoById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  getSimpleRecebimentoById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/busca/${id}`);
  }

  // Criar um novo recebimento
  createRecebimento(recebimento: any): Observable<any> {
    return this.http.post(this.baseUrl, recebimento);
  }

  // Atualizar recebimento por ID
  updateRecebimento(id: number, recebimento: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, recebimento);
  }

  // Deletar recebimento por ID
  deleteRecebimento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Buscar recebimentos com paginação e ordenação
  buscarRecebimentos(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.baseUrl}/busca`, { params });
  }

  buscarRecebimentoMercadoriasPorRazaoSocial(razaoSocial: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('razaoSocial', razaoSocial)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.baseUrl}/busca-por-razao-social`, { params });
  }
}
