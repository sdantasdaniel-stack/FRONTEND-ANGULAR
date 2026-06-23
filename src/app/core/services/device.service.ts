import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Device, DeviceRequest } from '../models/device.model';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly API = `${environment.apiUrl}/devices`;

  constructor(private http: HttpClient) {}

  listar(): Observable<Device[]> {
    return this.http.get<Device[]>(this.API);
  }

  listarAtivos(): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.API}/ativos`);
  }

  listarPorEmpresa(empresaId: number): Observable<Device[]> {
    return this.http.get<Device[]>(`${this.API}/empresa/${empresaId}`);
  }

  buscarPorId(id: number): Observable<Device> {
    return this.http.get<Device>(`${this.API}/${id}`);
  }

  criar(dto: DeviceRequest): Observable<Device> {
    return this.http.post<Device>(this.API, dto);
  }

  atualizar(id: number, dto: DeviceRequest): Observable<void> {
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