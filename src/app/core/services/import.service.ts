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

  private readonly BASE = `${environment.apiUrl}/devices/importar`;

  constructor(private http: HttpClient) {}

  // ... resto do código igual

  // ── endpoints reais ──────────────────────────────────────────────

  importarPorSerial(serial: string): Observable<ImportacaoResponse> {
    return this.http.post<ImportacaoResponse>(
      `${this.BASE}/importar/serial`,
      { serial }
    );
  }

  importarDispositivosCsv(arquivo: File): Observable<ImportacaoResponse> {
  const form = new FormData();
  form.append('arquivo', arquivo);  // era 'file', agora é 'arquivo'
  return this.http.post<ImportacaoResponse>(
    `${this.BASE}/arquivo`,         // era só BASE, agora é BASE + /arquivo
    form
  );
}

  // ── endpoints pendentes (stub no backend) ────────────────────────

  cadastrarDispositivosCsv(arquivo: File): Observable<ImportacaoResponse> {
    return this.uploadPendente(arquivo);
  }

  preCadastroPorSerialTxt(arquivo: File): Observable<ImportacaoResponse> {
    return this.uploadPendente(arquivo);
  }

  marcarMqeTxt(arquivo: File): Observable<ImportacaoResponse> {
    return this.uploadPendente(arquivo);
  }

  cadastrarPontosCsv(arquivo: File): Observable<ImportacaoResponse> {
    return this.uploadPendente(arquivo);
  }

  cadastrarPontosExcel(arquivo: File): Observable<ImportacaoResponse> {
    return this.uploadPendente(arquivo);
  }

  cadastrarPontosStg(arquivo: File): Observable<ImportacaoResponse> {
    return this.uploadPendente(arquivo);
  }

  importarSlf(arquivo: File): Observable<ImportacaoResponse> {
    return this.uploadPendente(arquivo);
  }

  associarImei(arquivo: File): Observable<ImportacaoResponse> {
    return this.uploadPendente(arquivo);
  }

  // ── helper privado ───────────────────────────────────────────────

  private uploadPendente(arquivo: File): Observable<ImportacaoResponse> {
  const form = new FormData();
  form.append('arquivo', arquivo);  // era 'file'
  return this.http.post<ImportacaoResponse>(
    `${this.BASE}/pendente`,
    form
  );
}
}