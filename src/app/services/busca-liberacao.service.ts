import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BuscaLiberacaoService {
  private baseUrl = environment.apiUrl + '/usuario/bloqueados';

  constructor(private http: HttpClient) {}

  getUsuariosBloqueados(): Observable<any> {
    return this.http.get(this.baseUrl);
  }
}
