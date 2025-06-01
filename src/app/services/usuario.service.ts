import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface CategoriaUsuario {
  idCategoria: number;
  descricaoCategoria: string;
}

export interface UsuarioFiltro {
  categoriaId?: number;
}

export interface UsuarioResponse {
  id: number;
  nomeUsuario: string;
  email: string;
  status: string;
  categoria: string;
  telefone: string;
}

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

  getCategorias(): Observable<CategoriaUsuario[]> {
    return this.http.get<CategoriaUsuario[]>(`${this.baseUrl}/categorias`);
  }

  gerarRelatorio(filtro: UsuarioFiltro): Observable<UsuarioResponse[]> {
    return this.http.post<UsuarioResponse[]>(`${this.baseUrl}/relatorios`, filtro);
  }
}
