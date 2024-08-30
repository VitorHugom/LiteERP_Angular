import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BuscaLiberacaoService {
  private baseUrl = 'http://localhost:8080/usuario/bloqueados';

  constructor(private http: HttpClient) {}

  getUsuariosBloqueados(): Observable<any> {
    return this.http.get(this.baseUrl);
  }
}
