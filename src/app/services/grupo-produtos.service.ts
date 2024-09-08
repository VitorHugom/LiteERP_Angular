import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GrupoProdutosService {
  private baseUrl = 'http://localhost:8080/grupo_produtos'; // Endpoint para grupos de produtos

  constructor(private http: HttpClient) {}

  // Busca todos os grupos de produtos
  getGruposProdutos(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  // Busca grupo de produtos por ID
  getGrupoProdutoById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  // Cria um novo grupo de produtos
  createGrupoProduto(grupoProduto: any): Observable<any> {
    return this.http.post(this.baseUrl, grupoProduto);
  }

  // Atualiza um grupo de produtos existente
  updateGrupoProduto(id: number, grupoProduto: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, grupoProduto);
  }

  // Deleta um grupo de produtos pelo ID
  deleteGrupoProduto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
  
}
