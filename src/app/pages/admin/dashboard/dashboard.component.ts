import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar.component';
import { EmpresaService } from '../../../core/services/empresa.service';
import { DeviceService } from '../../../core/services/device.service';
import { UsuarioService } from '../../../core/services/usuario.service';
import { AuthService } from '../../../core/services/auth.service';







@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Navbar],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  nomeUsuario = '';
  dataAtual = '';
  totalEmpresas = 0;
  totalUsuarios = 0;
  totalDevicesOnline = 0;

  constructor(
    private auth: AuthService,
    private empresaService: EmpresaService,
    private deviceService: DeviceService,
    private usuarioService: UsuarioService,
    private router: Router,
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
      agora.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
      ' às ' +
      agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    this.cdr.detectChanges();
  }

  private carregarEstatisticas() {
    this.empresaService.listar().subscribe({
      next: res => { this.totalEmpresas = res.filter(e => e.ativo).length; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.usuarioService.listar().subscribe({
      next: res => { this.totalUsuarios = res.length; this.cdr.detectChanges(); },
      error: () => {}
    });
    this.deviceService.listar().subscribe({
      next: res => { this.totalDevicesOnline = res.filter(d => d.status === 'ONLINE').length; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  navegar(rota: string) { this.router.navigate([rota]); }
}
