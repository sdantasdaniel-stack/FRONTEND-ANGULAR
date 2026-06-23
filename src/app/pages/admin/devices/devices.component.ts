import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar.component';
import { DeviceService } from '../../../core/services/device.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { Device, DeviceRequest } from '../../../core/models/device.model';
import { Empresa } from '../../../core/models/empresa.model';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [Navbar, FormsModule],
  templateUrl: './devices.component.html',
  styleUrl: './devices.component.css'
})
export class DevicesComponent implements OnInit {
  devices: Device[] = [];
  empresas: Empresa[] = [];
  formAberto = false;
  fNome = ''; fIdentificador = ''; fEmpresaId: number | null = null;
  fLatitude: number | null = null; fLongitude: number | null = null;
  filtroEmpresaId = '';
  toast = { visivel: false, mensagem: '' };
  private toastTimer: any;

  constructor(
    private deviceService: DeviceService,
    private empresaService: EmpresaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.empresaService.listar().subscribe({
      next: res => { this.empresas = [...res]; this.cdr.detectChanges(); }
    });
    this.carregar();
  }

  carregar() {
    this.deviceService.listar().subscribe({
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
      this.mostrarToast('Nome, identificador e empresa são obrigatórios'); return;
    }
    const dto: DeviceRequest = { nome: this.fNome.trim(), identificador: this.fIdentificador.trim(), empresaId: this.fEmpresaId, latitude: this.fLatitude, longitude: this.fLongitude };
    this.deviceService.criar(dto).subscribe({
      next: () => { this.carregar(); this.fecharForm(); this.mostrarToast('Device cadastrado com sucesso'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao cadastrar')
    });
  }

  desativar(d: Device) {
    this.deviceService.desativar(d.id).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Device desativado'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao desativar')
    });
  }

  reativar(d: Device) {
    this.deviceService.reativar(d.id).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Device reativado'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao reativar')
    });
  }

  deletar(d: Device) {
    if (!confirm(`Deletar "${d.nome}" permanentemente?`)) return;
    this.deviceService.deletar(d.id).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Device deletado'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao deletar')
    });
  }

  editar(d: Device) { this.router.navigate(['/admin/devices', d.id, 'editar']); }
  nomeEmpresa(id: number): string { return this.empresas.find(e => e.id === id)?.nome ?? `Empresa #${id}`; }

  private limparForm() { this.fNome = ''; this.fIdentificador = ''; this.fEmpresaId = null; this.fLatitude = null; this.fLongitude = null; }

  mostrarToast(mensagem: string) {
    this.toast = { visivel: true, mensagem };
    this.cdr.detectChanges();
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast.visivel = false; this.cdr.detectChanges(); }, 3000);
  }
}