import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Empresa, EmpresaRequest } from '../models/empresa.model';

@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly API = `${environment.apiUrl}/empresas`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Empresa[]> {
    return this.http.get<Empresa[]>(this.API);
  }

  buscarPorId(id: number): Observable<Empresa> {
    return this.http.get<Empresa>(`${this.API}/${id}`);
  }

  criar(dto: EmpresaRequest): Observable<Empresa> {
    return this.http.post<Empresa>(this.API, dto);
  }

  atualizar(id: number, dto: EmpresaRequest): Observable<void> {
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