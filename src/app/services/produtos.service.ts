import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private baseUrl = 'http://localhost:8080/produtos';

  constructor(private http: HttpClient) {}

  getProdutos(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getProdutoById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }
  createProduto(produto: any): Observable<any> {
    return this.http.post(this.baseUrl, produto);
  }
  
  updateProduto(id: string, produto: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, produto);
  }
  
  deleteProduto(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  searchProdutos(nome: string, page: number, size: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/search?nome=${nome}&page=${page}&size=${size}`);
  }
}
