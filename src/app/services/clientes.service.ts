import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface ClientesFiltro {
  dataNascimentoInicial: string; // "YYYY-MM-DD"
  dataNascimentoFinal:   string;
  vendedorId:            number;
  cidadeId:              number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private baseUrl = environment.apiUrl + '/clientes';

  private viacepUrl = 'https://viacep.com.br/ws';

  constructor(private http: HttpClient) {}

  /**
   * Converte uma data Java LocalDate [year, month, day] para string ISO (YYYY-MM-DD)
   */
  private convertJavaLocalDateToISO(javaDate: any): string | null {
    if (!javaDate) return null;
    if (Array.isArray(javaDate) && javaDate.length >= 3) {
      const [year, month, day] = javaDate;
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    return javaDate;
  }

  /**
   * Converte as datas de um cliente do formato Java para ISO
   */
  private convertClienteDates(cliente: any): any {
    if (!cliente) return cliente;

    return {
      ...cliente,
      dataNascimento: this.convertJavaLocalDateToISO(cliente.dataNascimento),
      dataCadastro: this.convertJavaLocalDateToISO(cliente.dataCadastro)
    };
  }

  getClientes(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getClienteById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`).pipe(
      map(cliente => this.convertClienteDates(cliente))
    );
  }

  getClienteByIdBusca(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/busca/${id}`);
  }

  createCliente(cliente: any): Observable<any> {
    return this.http.post(this.baseUrl, cliente);
  }

  updateCliente(id: string, cliente: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, cliente);
  }

  deleteCliente(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  getEnderecoByCep(cep: string): Observable<any> {
    return this.http.get(`${this.viacepUrl}/${cep}/json`);
  }
  
  getCidadeByCodigoIbge(codigoIbge: string): Observable<any> {
    return this.http.get(environment.apiUrl + `/cidades/codigoIbge/${codigoIbge}`);
  }

  searchClientes(nome: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('nome', nome)
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }

  getClientesByRazaoSocialBusca(razaoSocial: string, page: number = 0): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('razaoSocial', razaoSocial);
    return this.http.get(`${this.baseUrl}/busca-por-razao-social`, { params });
  }

  getClientesBusca(page: number = 0): Observable<any> {
    const params = new HttpParams().set('page', page.toString());
    return this.http.get(`${this.baseUrl}/busca`, { params });
  }

  gerarRelatorio(filtro: ClientesFiltro): Observable<any[]> {
    return this.http.post<any[]>(`${this.baseUrl}/relatorio`, filtro);
  }
}
