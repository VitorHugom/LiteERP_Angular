import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuarioService {

  private baseUrl = environment.apiUrl + '/usuario';

  constructor(private http: HttpClient) {}

  getUsuarioById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  aprovarUsuario(id: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/aprovar/${id}`, {});
  }
}
