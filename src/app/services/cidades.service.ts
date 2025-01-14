import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CidadesService {

  private baseUrl = environment.apiUrl + '/cidades'; // URL do seu backend

  constructor(private http: HttpClient) { }

  // Método para buscar as cidades com base no nome digitado (filtro) e com lazy loading
  searchCidades(nome: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('nome', nome)
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }

  // Método para obter cidade por ID
  getCidadeById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }
}
