import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private baseUrl = 'http://localhost:8080/pedidos';

  constructor(private http: HttpClient) {}

  getPedidos(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getPedidoById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  createPedido(pedido: any): Observable<any> {
    return this.http.post(this.baseUrl, pedido);
  }
  
  updatePedido(id: string, pedido: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, pedido);
  }
  
  deletePedido(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  addItemPedido(idPedido: string, item: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/${idPedido}/itens`, item);  // Chama o endpoint /pedidos/{id}/itens
  }
  
  getItensPedido(idPedido: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${idPedido}/itens`);  // Chama o endpoint /pedidos/{id}/itens
  }

  updateItemPedido(idPedido: number, idItem: number, itemPayload: any): Observable<any> {
    const url = `${this.baseUrl}/itens/${idItem}`; // Endpoint de atualização
    return this.http.put(url, itemPayload); // Faz a requisição PUT
  }

  deleteItemPedido(idItensPedido: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/itens/${idItensPedido}`);
  }
}
