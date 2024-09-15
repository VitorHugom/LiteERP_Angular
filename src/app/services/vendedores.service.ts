import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VendedoresService {

  private baseUrl = 'http://localhost:8080/vendedores'; 

  constructor(private http: HttpClient) { }

  searchVendedores(nome: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('nome', nome)
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<any>(`${this.baseUrl}/search`, { params });
  }

  getVendedorById(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/${id}`);
  }

  // Busca todos os vendedores
  getVendedores(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  // Cria um novo vendedor
  createVendedor(vendedor: any): Observable<any> {
    return this.http.post(this.baseUrl, vendedor);
  }

  // Atualiza um vendedor existente
  updateVendedor(id: number, vendedor: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, vendedor);
  }

  // Deleta um vendedor pelo ID
  deleteVendedor(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
