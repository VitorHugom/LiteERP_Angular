import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MovimentoEstoqueService {
  private baseUrl = 'http://localhost:8080/movimento-estoque';

  constructor(private http: HttpClient) {}

  // Busca movimentos de estoque com base em um intervalo de datas
  buscarMovimentosPorDatas(dataInicio: string, dataFim: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('startDate', dataInicio)
      .set('endDate', dataFim)
      .set('page', page.toString())
      .set('size', size.toString());
  
    console.log('Parametros:', params.toString()); // Log dos parâmetros
  
    return this.http.get(`${this.baseUrl}/busca-por-datas`, { params });
  }  

  // Métodos adicionais, se necessário
  getMovimentoById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createMovimento(movimento: any): Observable<any> {
    return this.http.post(this.baseUrl, movimento);
  }

  updateMovimento(id: string, movimento: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, movimento);
  }

  deleteMovimento(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
