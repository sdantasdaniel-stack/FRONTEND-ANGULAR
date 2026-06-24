import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ImportacaoResponse {
  message: string;
  totalLinhas?: number;
  sucesso?: number;
  falhas?: number;
  erros?: string[];
}

@Injectable({ providedIn: 'root' })
export class ImportService {

  // Ajuste o prefixo base conforme a URL real do seu Spring Boot
  private readonly BASE = `${environment.apiUrl}/devices/importar`;

  constructor(private http: HttpClient) {}

  importarPorSerial(serial: string): Observable<ImportacaoResponse> {
    return this.http.post<ImportacaoResponse>(
      `${this.BASE}/serial`,
      { serial }
    );
  }

  importarDispositivosCsv(arquivo: File): Observable<ImportacaoResponse> {
    return this.upload(`${this.BASE}/arquivo`, arquivo);
  }

  cadastrarDispositivosCsv(arquivo: File): Observable<ImportacaoResponse> {
    return this.upload(`${this.BASE}/cadastrar`, arquivo);
  }

  preCadastroPorSerialTxt(arquivo: File): Observable<ImportacaoResponse> {
    return this.upload(`${this.BASE}/pre-cadastro`, arquivo);
  }

  marcarMqeTxt(arquivo: File): Observable<ImportacaoResponse> {
    return this.upload(`${this.BASE}/mqe`, arquivo);
  }

  cadastrarPontosCsv(arquivo: File): Observable<ImportacaoResponse> {
    return this.upload(`${this.BASE}/pontos/csv`, arquivo);
  }

  cadastrarPontosExcel(arquivo: File): Observable<ImportacaoResponse> {
    return this.upload(`${this.BASE}/pontos/excel`, arquivo);
  }

  cadastrarPontosStg(arquivo: File): Observable<ImportacaoResponse> {
    return this.upload(`${this.BASE}/pontos/stg`, arquivo);
  }

  importarSlf(arquivo: File): Observable<ImportacaoResponse> {
    return this.upload(`${this.BASE}/slf`, arquivo);
  }

  associarImei(arquivo: File): Observable<ImportacaoResponse> {
    return this.upload(`${this.BASE}/imei`, arquivo);
  }

  private upload(url: string, arquivo: File): Observable<ImportacaoResponse> {
    const form = new FormData();
    form.append('arquivo', arquivo);
    return this.http.post<ImportacaoResponse>(url, form);
  }
}