import { environment } from '../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  nomeUsuario = '';
  dataAtual = '';
  totalEmpresas = 0;
  totalUsuarios = 0;
  totalDevicesOnline = 0;

  private readonly API = environment.apiUrl;

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.nomeUsuario = this.auth.getNome();
    this.atualizarData();
    setInterval(() => this.atualizarData(), 60000);
    this.carregarEstatisticas();
  }

  private atualizarData() {
    const agora = new Date();
    this.dataAtual =
      agora.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }) +
      ' às ' +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    this.cdr.detectChanges();
  }

  private carregarEstatisticas() {
    this.http.get<any[]>(`${this.API}/empresas`).subscribe({
      next: res => {
        this.totalEmpresas = res.filter(e => e.ativo).length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
    this.http.get<any[]>(`${this.API}/usuarios`).subscribe({
      next: res => {
        this.totalUsuarios = res.length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
    this.http.get<any[]>(`${this.API}/devices`).subscribe({
      next: res => {
        this.totalDevicesOnline = res.filter((d: any) => d.status === 'ONLINE').length;
        this.cdr.detectChanges();
      },
      error: () => {}
    });
  }

  logout() { this.auth.logout(); }
  navegar(rota: string) { this.router.navigate([rota]); }
}


