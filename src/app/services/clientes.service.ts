import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private baseUrl = 'http://localhost:8080/clientes';

  constructor(private http: HttpClient) {}

  getClientes(): Observable<any> {
    return this.http.get(this.baseUrl);
  }

  getClienteById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
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
}
