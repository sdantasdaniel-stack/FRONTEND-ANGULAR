import { environment } from '../../../environments/environment';
import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { Device } from '../../core/models/device.model';
import { Empresa } from '../../core/models/empresa.model';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Navbar } from '../../shared/components/navbar/navbar.component';

@Component({
  selector: 'app-mapa',
  standalone: true,
  imports: [Navbar, FormsModule],
  templateUrl: './mapa.component.html',
  styleUrl: './mapa.component.css',
})
export class MapaComponent implements OnInit, OnDestroy {
  private readonly API = environment.apiUrl;

  nomeUsuario = '';
  isAdmin = false;
  devices: Device[] = [];
  empresas: Empresa[] = [];
  filtroEmpresaId = '';
  private stompClient: Client | null = null;
  private map: any = null;
  private markers: Record<number, any> = {};
  private L: any = null;
  private mapaPronto = false;

  constructor(
    private auth: AuthService,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.nomeUsuario = this.auth.getNome();
    this.isAdmin = this.auth.isAdmin();

    this.carregarLeaflet().then(() => {
      this.inicializarMapa();
      this.mapaPronto = true;
      this.carregarDados();
      this.conectarWebSocket();
    });
  }

  ngOnDestroy() {
    if (this.stompClient) this.stompClient.deactivate();
    if (this.map) { this.map.remove(); this.map = null; }
  }

  private carregarLeaflet(): Promise<void> {
    return new Promise((resolve) => {
      if ((window as any).L) {
        this.L = (window as any).L;
        resolve();
        return;
      }
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);

      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = () => { this.L = (window as any).L; resolve(); };
      document.head.appendChild(script);
    });
  }

  private inicializarMapa() {
    this.map = this.L.map('map').setView([-15.7801, -47.9292], 4);
    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map);
  }

  private carregarDados() {
    // ADMIN usa /devices (vê todos), USER usa /devices/ativos
    // ambos os endpoints já retornam latitude/longitude no DeviceResponseDTO
    const endpoint = this.isAdmin ? '/devices' : '/devices/ativos';

    this.http.get<Device[]>(`${this.API}${endpoint}`).subscribe({
      next: (res) => {
        // filtra apenas devices que têm coordenadas
        this.devices = res.filter(d => d.latitude != null && d.longitude != null);
        this.cdr.detectChanges();

        // só renderiza se o mapa já estiver inicializado
        if (this.mapaPronto) {
          this.renderizarMarcadores(this.devicesFiltrados);
        }
      },
      error: () => {}
    });

    if (this.isAdmin) {
      this.http.get<Empresa[]>(`${this.API}/empresas`).subscribe({
        next: (res) => { this.empresas = res; this.cdr.detectChanges(); },
        error: () => {}
      });
    }
  }

  get devicesFiltrados(): Device[] {
    if (!this.filtroEmpresaId) return this.devices;
    return this.devices.filter(d => d.empresaId === Number(this.filtroEmpresaId));
  }

  get totalOnline(): number {
    return this.devicesFiltrados.filter(d => d.status === 'ONLINE').length;
  }

  get totalOffline(): number {
    return this.devicesFiltrados.filter(d => d.status === 'OFFLINE').length;
  }

  filtrar() {
    this.renderizarMarcadores(this.devicesFiltrados);
    this.cdr.detectChanges();
  }

  focarDevice(device: Device) {
    if (!this.map || device.latitude == null || device.longitude == null) return;
    this.map.setView([device.latitude, device.longitude], 14, { animate: true });
    const marker = this.markers[device.id];
    if (marker) marker.openPopup();
  }

  private criarIcone(status: string): any {
  const cor = status === 'ONLINE' ? '#16a34a' : '#dc2626';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="7" fill="${cor}" stroke="white" stroke-width="2.5"/>
  </svg>`;
  return this.L.divIcon({
    className: '',
    html: svg,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -12],
  });
}

  private renderizarMarcadores(lista: Device[]) {
  Object.values(this.markers).forEach((m) => m.remove());
  this.markers = {};

    lista.forEach((d) => {
    if (d.latitude == null || d.longitude == null) return;
    const marker = this.L.marker([d.latitude, d.longitude], { icon: this.criarIcone(d.status) })
      .addTo(this.map)
      .bindPopup(this.popupHtml(d), { maxWidth: 220 });
    this.markers[d.id] = marker;
  });

  if (lista.length > 0) {
    const group = this.L.featureGroup(Object.values(this.markers));
    this.map.fitBounds(group.getBounds().pad(0.3));
  }

  this.cdr.detectChanges();
  }

  private popupHtml(d: Device): string {
    const cor = d.status === 'ONLINE' ? '#16a34a' : '#94a3b8';
    return `<div style="padding:12px 14px;min-width:170px;font-family:'DM Sans',sans-serif;">
      <div style="font-size:14px;font-weight:700;color:#0f172a;margin-bottom:3px;">${d.nome}</div>
      <div style="font-size:12px;color:#64748b;font-family:monospace;margin-bottom:6px;">${d.identificador}</div>
      <span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:${cor};">
        <span style="width:6px;height:6px;border-radius:50%;background:${cor};"></span>${d.status}
      </span>
    </div>`;
  }

  private conectarWebSocket() {
    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(`${this.API}/ws`),
      reconnectDelay: 5000,
      debug: () => {},
    });

    this.stompClient.onConnect = () => {
      this.stompClient!.subscribe('/topic/devices', (msg) => {
        // executa dentro do NgZone para garantir detecção de mudança
        this.ngZone.run(() => {
          try {
            const update = JSON.parse(msg.body);
            this.processarMensagem(update);
          } catch {}
        });
      });
    };

    this.stompClient.activate();
  }

  private processarMensagem(update: any) {
    if (update.tipo === 'status') {
      const device = this.devices.find(d => d.id === update.id);
      if (device) {
        device.status = update.status;
        const marker = this.markers[update.id];
        if (marker) {
          const cor = update.status === 'ONLINE' ? '#16a34a' : '#94a3b8';
          marker.setIcon(this.L.divIcon({
            className: '',
            html: `<div style="width:14px;height:14px;border-radius:50%;background:${cor};border:2.5px solid white;box-shadow:0 1px 5px rgba(0,0,0,.3);"></div>`,
            iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -10],
          }));
          marker.setPopupContent(this.popupHtml(device));
        }
      }
      this.cdr.detectChanges();
      return;
    }

    if (update.tipo === 'editado' || update.tipo === 'reativado') {
      const idx = this.devices.findIndex(d => d.id === update.id);
      if (idx !== -1) {
        this.devices[idx] = {
          ...this.devices[idx],
          nome: update.nome,
          identificador: update.identificador,
          status: update.status,
          ativo: update.ativo,
          latitude: update.lat,
          longitude: update.lng,
        };
      } else if (update.lat != null && update.ativo) {
        this.devices.push({
          id: update.id,
          nome: update.nome,
          identificador: update.identificador,
          status: update.status,
          ativo: update.ativo,
          empresaId: update.empresaId,
          latitude: update.lat,
          longitude: update.lng,
        });
      }
      // re-filtra apenas devices com coordenadas
      this.devices = this.devices.filter(d => d.latitude != null && d.longitude != null);
      this.renderizarMarcadores(this.devicesFiltrados);
      return;
    }

    if (update.tipo === 'desativado' || update.tipo === 'deletado') {
      this.devices = this.devices.filter(d => d.id !== update.id);
      const marker = this.markers[update.id];
      if (marker) { marker.remove(); delete this.markers[update.id]; }
      this.cdr.detectChanges();
    }
  }

  
}

