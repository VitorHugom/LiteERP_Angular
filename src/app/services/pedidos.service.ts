import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { PedidoBuscaDTO, PedidosBuscaResponse } from '../models/pedido.model';

export interface PedidosFiltro {
  idCliente?: number;
  idVendedor?: number;
  status?: string;
  idTipoCobranca?: number;
  dataEmissaoInicio?: string;
  dataEmissaoFim?: string;
  valorTotalInical?: number;
  valorTotalFinal?: number;
}


@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private baseUrl = environment.apiUrl + '/pedidos';

  constructor(private http: HttpClient) {}

  /**
   * Converte array de data do Java [ano, mês, dia, hora, minuto, segundo, nano]
   * para objeto Date do JavaScript
   */
  private convertJavaDateToDate(dateArray: any): Date | null {
    if (!dateArray) {
      return null;
    }

    // Se já for uma Date, retorna
    if (dateArray instanceof Date) {
      return dateArray;
    }

    // Se for uma string ISO, converte para Date
    if (typeof dateArray === 'string') {
      return new Date(dateArray);
    }

    // Se for um array (formato do Java LocalDateTime)
    if (Array.isArray(dateArray) && dateArray.length >= 3) {
      const [year, month, day, hour = 0, minute = 0, second = 0, nano = 0] = dateArray;
      // Mês no JavaScript é 0-indexed, então subtraímos 1
      return new Date(year, month - 1, day, hour, minute, second, Math.floor(nano / 1000000));
    }

    return null;
  }

  /**
   * Converte um pedido de busca, transformando a data de array para Date
   */
  private convertPedidoBusca(pedido: any): PedidoBuscaDTO {
    return {
      ...pedido,
      dataEmissao: this.convertJavaDateToDate(pedido.dataEmissao) || pedido.dataEmissao
    };
  }

  getPedidos(): Observable<any> {
    return this.http.get<any[]>(this.baseUrl).pipe(
      map(pedidos => pedidos.map(pedido => ({
        ...pedido,
        dataEmissao: this.convertJavaDateToDate(pedido.dataEmissao) || pedido.dataEmissao
      })))
    );
  }

  getPedidoById(id: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`).pipe(
      map(pedido => ({
        ...pedido,
        dataEmissao: this.convertJavaDateToDate(pedido.dataEmissao) || pedido.dataEmissao
      }))
    );
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

  updateItemPedido(_idPedido: number, idItem: number, itemPayload: any): Observable<any> {
    const url = `${this.baseUrl}/itens/${idItem}`; // Endpoint de atualização
    return this.http.put(url, itemPayload); // Faz a requisição PUT
  }

  deleteItemPedido(idItensPedido: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/itens/${idItensPedido}`);
  }

  getPedidosEmAberto(): Observable<any> {
    return this.http.get<any[]>(`${this.baseUrl}/em-aberto`).pipe(
      map(pedidos => pedidos.map(pedido => ({
        ...pedido,
        dataEmissao: this.convertJavaDateToDate(pedido.dataEmissao) || pedido.dataEmissao
      })))
    );
  }

  atualizarStatusPedido(id: number, status: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/status`, { status });
  }

  // Novo método para consumir o endpoint de busca com paginação e ordenação
  getPedidosBusca(page: number = 0, size: number = 10): Observable<PedidosBuscaResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PedidosBuscaResponse>(`${this.baseUrl}/busca`, { params }).pipe(
      map(response => ({
        ...response,
        content: response.content.map(pedido => this.convertPedidoBusca(pedido))
      }))
    );
  }

  buscarPedidosPorRazaoSocial(razaoSocial: string, page: number = 0, size: number = 10): Observable<PedidosBuscaResponse> {
    const params = new HttpParams()
      .set('razaoSocial', razaoSocial)
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PedidosBuscaResponse>(`${this.baseUrl}/busca-por-razao-social`, { params }).pipe(
      map(response => ({
        ...response,
        content: response.content.map(pedido => this.convertPedidoBusca(pedido))
      }))
    );
  }

  getSimplePedidoById(id: string): Observable<PedidoBuscaDTO> {
    return this.http.get<any>(`${this.baseUrl}/busca/${id}`).pipe(
      map(pedido => this.convertPedidoBusca(pedido))
    );
  }

  gerarRelatorio(filtro: PedidosFiltro): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/relatorios`, filtro);
  }
}
