import { environment } from '../../../../environments/environment';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Device, DeviceRequest } from '../../../core/models/device.model';
import { Empresa } from '../../../core/models/empresa.model';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

@Component({
  selector: 'app-meus-devices',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './meus-devices.component.html',
  styleUrl: './meus-devices.component.css',
})
export class MeusDevicesComponent implements OnInit, OnDestroy {
  private readonly API = environment.apiUrl;

  nomeUsuario = '';
  empresas: Empresa[] = [];
  empresaIdSelecionada: number | null = null;
  devices: Device[] = [];
  formAberto = false;

  fNome = '';
  fIdentificador = '';
  fLatitude: number | null = null;
  fLongitude: number | null = null;

  toast = { visivel: false, mensagem: '' };
  private toastTimer: any;
  private stompClient: Client | null = null;

  constructor(
  private auth: AuthService,
  private router: Router,
  private http: HttpClient,
  private cdr: ChangeDetectorRef,
  private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.nomeUsuario = this.auth.getNome();
    const usuario = this.auth.getUsuario();
    this.empresas = usuario?.empresas.filter(e => e.ativo) ?? [];
    this.cdr.detectChanges();
    this.conectarWebSocket();
  }

  ngOnDestroy() {
    if (this.stompClient) this.stompClient.deactivate();
  }

  selecionarEmpresa() {
    if (!this.empresaIdSelecionada) return;
    this.carregarDevices();
    this.formAberto = false;
    this.limparForm();
  }

  carregarDevices() {
    if (!this.empresaIdSelecionada) return;
    this.http.get<Device[]>(`${this.API}/devices/empresa/${this.empresaIdSelecionada}`).subscribe({
      next: res => { this.devices = [...res]; this.cdr.detectChanges(); },
      error: () => this.mostrarToast('Erro ao carregar devices')
    });
  }

  abrirForm() { this.formAberto = true; }
  fecharForm() { this.formAberto = false; this.limparForm(); }

  cadastrar() {
    if (!this.empresaIdSelecionada) { this.mostrarToast('Selecione uma empresa primeiro'); return; }
    if (!this.fNome.trim()) { this.mostrarToast('O nome é obrigatório'); return; }
    if (!this.fIdentificador.trim()) { this.mostrarToast('O identificador é obrigatório'); return; }

    const dto: DeviceRequest = {
      nome: this.fNome.trim(),
      identificador: this.fIdentificador.trim(),
      empresaId: this.empresaIdSelecionada,
      latitude: this.fLatitude,
      longitude: this.fLongitude
    };

    this.http.post<Device>(`${this.API}/devices`, dto).subscribe({
      next: () => { this.carregarDevices(); this.fecharForm(); this.mostrarToast('Device cadastrado com sucesso'); },
      error: err => this.mostrarToast(err?.error?.mensagem ?? 'Erro ao cadastrar')
    });
  }

  private conectarWebSocket() {
  this.stompClient = new Client({
    webSocketFactory: () => new SockJS(`${this.API}/ws`),
    reconnectDelay: 5000,
    debug: () => {}
  });

  this.stompClient.onConnect = () => {

    this.stompClient!.subscribe('/topic/devices', () => {
      this.ngZone.run(() => {
        if (this.empresaIdSelecionada) this.carregarDevices();
      });
    });

    this.stompClient!.subscribe('/topic/empresas', msg => {
      this.ngZone.run(() => {
        try {
          const update = JSON.parse(msg.body);
          const usuario = this.auth.getUsuario();
          const pertence = usuario?.empresas.some(e => e.id === update.id);
          if (!pertence) return;

          this.http.get<Empresa[]>(`${this.API}/empresas/ativas`).subscribe({
            next: empresasAtualizadas => {
              this.empresas = empresasAtualizadas;
              if (this.empresaIdSelecionada) {
                const aindaAtiva = this.empresas.some(e => e.id === this.empresaIdSelecionada);
                if (!aindaAtiva) {
                  this.empresaIdSelecionada = null;
                  this.devices = [];
                }
              }
              this.cdr.detectChanges();
            },
            error: () => {}
          });
        } catch {}
      });
    });
  };

  this.stompClient.activate();
  }

  private limparForm() {
    this.fNome = ''; this.fIdentificador = ''; this.fLatitude = null; this.fLongitude = null;
  }

  mostrarToast(mensagem: string) {
    this.toast = { visivel: true, mensagem };
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast.visivel = false; this.cdr.detectChanges(); }, 3500);
  }

  logout() { this.auth.logout(); }
  navegar(rota: string) { this.router.navigate([rota]); }
}

