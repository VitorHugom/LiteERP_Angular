import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

interface AuthResponse {
  nome: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private loginUrl = environment.apiUrl + '/auth/login'; // URL do endpoint de login

  constructor(private http: HttpClient) {}

  login(credentials: { nomeUsuario: string; senha: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(this.loginUrl, credentials);
  }
}
