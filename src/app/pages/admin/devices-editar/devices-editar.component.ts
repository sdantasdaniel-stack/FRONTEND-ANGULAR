import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Empresa } from '../../../core/models/empresa.model';
import { DeviceRequest } from '../../../core/models/device.model';

@Component({
  selector: 'app-devices-editar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './devices-editar.component.html',
  styleUrl: './devices-editar.component.css',
})
export class DevicesEditarComponent implements OnInit {
  private readonly API = 'http://localhost:8080';

  nomeUsuario = '';
  id!: number;
  nome = '';
  identificador = '';
  empresaId: number | null = null;
  latitude: number | null = null;
  longitude: number | null = null;
  empresas: Empresa[] = [];
  erro = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.nomeUsuario = this.auth.getNome();
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.http.get<Empresa[]>(`${this.API}/empresas`).subscribe({
      next: res => { this.empresas = [...res]; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.http.get<any>(`${this.API}/devices/${this.id}`).subscribe({
      next: res => {
        this.nome = res.nome;
        this.identificador = res.identificador;
        this.empresaId = res.empresaId;
        this.latitude = res.latitude;
        this.longitude = res.longitude;
        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/admin/devices'])
    });
  }

  salvar() {
    if (!this.nome.trim() || !this.identificador.trim() || !this.empresaId) {
      this.erro = 'Nome, identificador e empresa são obrigatórios';
      this.cdr.detectChanges();
      return;
    }
    const dto: DeviceRequest = {
      nome: this.nome.trim(),
      identificador: this.identificador.trim(),
      empresaId: this.empresaId,
      latitude: this.latitude,
      longitude: this.longitude
    };
    this.http.put(`${this.API}/devices/${this.id}`, dto).subscribe({
      next: () => this.router.navigate(['/admin/devices']),
      error: err => { this.erro = err.error?.mensagem ?? 'Erro ao salvar'; this.cdr.detectChanges(); }
    });
  }

  logout() { this.auth.logout(); }
  navegar(rota: string) { this.router.navigate([rota]); }
}