import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UploadXmlResponse, VinculacaoProdutoRequest, VinculacaoProdutoResponse } from '../models/upload-xml.models';

@Injectable({
  providedIn: 'root'
})
export class RecebimentoMercadoriasService {
  private baseUrl = environment.apiUrl + '/recebimento_mercadorias';

  constructor(private http: HttpClient) {}

  /**
   * Converte array Java LocalDate para string ISO (YYYY-MM-DD)
   */
  private convertJavaLocalDateToISO(javaDate: any): string | null {
    if (!javaDate) return null;

    // Se for array Java LocalDate [year, month, day]
    if (Array.isArray(javaDate) && javaDate.length >= 3) {
      const [year, month, day] = javaDate;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }

    // Se já for string, retorna como está
    return javaDate;
  }

  /**
   * Converte as datas de um recebimento de mercadorias
   */
  private convertRecebimentoDates(recebimento: any): any {
    if (!recebimento) return recebimento;

    return {
      ...recebimento,
      dataRecebimento: this.convertJavaLocalDateToISO(recebimento.dataRecebimento)
    };
  }

  // Listar todos os recebimentos
  getRecebimentos(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  // Buscar recebimento por ID
  getRecebimentoById(id: number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`).pipe(
      map(recebimento => this.convertRecebimentoDates(recebimento))
    );
  }

  getSimpleRecebimentoById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/busca/${id}`).pipe(
      map(recebimento => this.convertRecebimentoDates(recebimento))
    );
  }

  // Criar um novo recebimento
  createRecebimento(recebimento: any): Observable<any> {
    return this.http.post(this.baseUrl, recebimento).pipe(
      map(response => this.convertRecebimentoDates(response))
    );
  }

  // Atualizar recebimento por ID
  updateRecebimento(id: number, recebimento: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, recebimento).pipe(
      map(response => this.convertRecebimentoDates(response))
    );
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

  // Upload e processamento de XML NFe
  uploadXmlNfe(arquivo: File): Observable<UploadXmlResponse> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    return this.http.post<UploadXmlResponse>(`${this.baseUrl}/upload-xml`, formData);
  }

  // Vincular produto ao fornecedor (criar código do fornecedor)
  vincularProdutoFornecedor(request: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/produto-fornecedor-codigo`, request);
  }
}
