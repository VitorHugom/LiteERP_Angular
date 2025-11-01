import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface MovimentoEstoque {
  id: number;
  idPedido: number | null;
  idRecebimentoMercadoria: number | null;
  produto: string;
  qtd: number;
  dataMovimentacao: string; // Convertido para string ISO
}

export interface MovimentoEstoqueResponse {
  content: MovimentoEstoque[];
  pageable: any;
  totalPages: number;
  totalElements: number;
  last: boolean;
  first: boolean;
  numberOfElements: number;
  size: number;
  number: number;
  sort: any;
  empty: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class MovimentoEstoqueService {
  private baseUrl = environment.apiUrl + '/movimento-estoque';

  constructor(private http: HttpClient) {}

  /**
   * Converte array Java LocalDateTime para string ISO
   */
  private convertJavaLocalDateTimeToISO(javaDateTime: any): string | null {
    if (!javaDateTime) return null;

    // Se for array Java LocalDateTime [year, month, day, hour, minute, second, nanosecond]
    if (Array.isArray(javaDateTime) && javaDateTime.length >= 6) {
      const [year, month, day, hour, minute, second] = javaDateTime;
      const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
      return `${dateStr}T${timeStr}`;
    }

    // Se já for string, retorna como está
    return javaDateTime;
  }

  /**
   * Converte as datas de um movimento de estoque
   */
  private convertMovimentoDates(movimento: any): MovimentoEstoque {
    return {
      ...movimento,
      dataMovimentacao: this.convertJavaLocalDateTimeToISO(movimento.dataMovimentacao)
    };
  }

  /**
   * Converte as datas de todos os movimentos na resposta paginada
   */
  private convertResponseDates(response: any): MovimentoEstoqueResponse {
    return {
      ...response,
      content: response.content.map((movimento: any) => this.convertMovimentoDates(movimento))
    };
  }

  // Busca movimentos de estoque com base em um intervalo de datas
  buscarMovimentosPorDatas(dataInicio: string, dataFim: string, page: number = 0, size: number = 10): Observable<MovimentoEstoqueResponse> {
    const params = new HttpParams()
      .set('startDate', dataInicio)
      .set('endDate', dataFim)
      .set('page', page.toString())
      .set('size', size.toString());

    console.log('Parametros:', params.toString()); // Log dos parâmetros

    return this.http.get<any>(`${this.baseUrl}/busca-por-datas`, { params }).pipe(
      map(response => this.convertResponseDates(response))
    );
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
