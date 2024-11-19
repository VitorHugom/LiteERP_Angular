import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EstoqueService {
  private baseUrl = 'http://localhost:8080/estoque';

  constructor(private http: HttpClient) {}

  // Busca estoque de um produto específico por ID
  obterEstoquePorProduto(idProduto: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/produto/${idProduto}`);
  }

  // Busca todos os produtos no estoque com paginação
  buscarTodosProdutosNoEstoque(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${this.baseUrl}/todos`, { params });
  }

  // Busca produtos no estoque pela descrição com paginação
  buscarProdutosNoEstoquePorDescricao(descricao: string, page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('descricao', descricao)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get(`${this.baseUrl}/buscar-por-descricao`, { params });
  }
}
