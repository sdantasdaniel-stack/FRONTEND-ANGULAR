import { environment } from '../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Device, DeviceRequest } from '../../../core/models/device.model';
import { Empresa } from '../../../core/models/empresa.model';
import { Navbar } from '../../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [Navbar, FormsModule],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css',
})
export class DevicesComponent implements OnInit {
  private readonly API = environment.apiUrl;

  nomeUsuario = '';
  devices: Device[] = [];
  empresas: Empresa[] = [];
  formAberto = false;

  fNome = '';
  fIdentificador = '';
  fEmpresaId: number | null = null;
  fLatitude: number | null = null;
  fLongitude: number | null = null;
  filtroEmpresaId = '';

  toast = { visivel: false, mensagem: '' };
  private toastTimer: any;

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.nomeUsuario = this.auth.getNome();
    this.http.get<Empresa[]>(`${this.API}/empresas`).subscribe({
      next: res => { this.empresas = [...res]; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.carregar();
  }

  carregar() {
    this.http.get<Device[]>(`${this.API}/devices`).subscribe({
      next: res => { this.devices = [...res]; this.cdr.detectChanges(); },
      error: () => this.mostrarToast('Erro ao carregar devices')
    });
  }

  get devicesFiltrados(): Device[] {
    if (!this.filtroEmpresaId) return this.devices;
    return this.devices.filter(d => d.empresaId === Number(this.filtroEmpresaId));
  }

  abrirForm() { this.formAberto = true; }
  fecharForm() { this.formAberto = false; this.limparForm(); }

  cadastrar() {
    if (!this.fNome.trim() || !this.fIdentificador.trim() || !this.fEmpresaId) {
      this.mostrarToast('Nome, identificador e empresa são obrigatórios');
      return;
    }
    const dto: DeviceRequest = {
      nome: this.fNome.trim(),
      identificador: this.fIdentificador.trim(),
      empresaId: this.fEmpresaId,
      latitude: this.fLatitude,
      longitude: this.fLongitude
    };
    this.http.post<Device>(`${this.API}/devices`, dto).subscribe({
      next: () => { this.carregar(); this.fecharForm(); this.mostrarToast('Device cadastrado com sucesso'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao cadastrar')
    });
  }

  desativar(device: Device) {
    this.http.delete(`${this.API}/devices/${device.id}`).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Device desativado'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao desativar')
    });
  }

  reativar(device: Device) {
    this.http.patch(`${this.API}/devices/${device.id}/reativar`, {}).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Device reativado'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao reativar')
    });
  }

  deletar(device: Device) {
    if (!confirm(`Deletar "${device.nome}" permanentemente? Esta ação não pode ser desfeita.`)) return;
    this.http.delete(`${this.API}/devices/${device.id}/deletar`).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Device deletado'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao deletar')
    });
  }

  editar(device: Device) { this.router.navigate(['/admin/devices', device.id, 'editar']); }

  nomeEmpresa(id: number): string {
    return this.empresas.find(e => e.id === id)?.nome ?? `Empresa #${id}`;
  }

  private limparForm() {
    this.fNome = ''; this.fIdentificador = ''; this.fEmpresaId = null;
    this.fLatitude = null; this.fLongitude = null;
  }

  mostrarToast(mensagem: string) {
    this.toast = { visivel: true, mensagem };
    this.cdr.detectChanges();
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toast.visivel = false;
      this.cdr.detectChanges();
    }, 3000);
  }

  
}

