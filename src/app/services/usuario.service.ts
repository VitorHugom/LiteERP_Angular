import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private baseUrl = 'http://localhost:8080/usuario';

  constructor(private http: HttpClient) {}

  getUsuarioById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  aprovarUsuario(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/aprovar/${id}`, {});
  }
}
