import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Usuario, UsuarioRequest } from '../models/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private readonly API = `${environment.apiUrl}/usuarios`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.API);
  }

  buscarPorId(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.API}/${id}`);
  }

  criar(dto: UsuarioRequest): Observable<Usuario> {
    return this.http.post<Usuario>(this.API, dto);
  }

  atualizar(id: number, dto: UsuarioRequest): Observable<void> {
    return this.http.put<void>(`${this.API}/${id}`, dto);
  }

  desativar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}`);
  }

  reativar(id: number): Observable<void> {
    return this.http.patch<void>(`${this.API}/${id}/reativar`, {});
  }

  deletar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/${id}/deletar`);
  }
}