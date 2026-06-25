import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar.component';
import { DeviceService } from '../../../core/services/device.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { DeviceRequest } from '../../../core/models/device.model';
import { Empresa } from '../../../core/models/empresa.model';

@Component({
  selector: 'app-devices-editar',
  standalone: true,
  imports: [Navbar, FormsModule],
  templateUrl: './devices-editar.component.html',
  styleUrl: './devices-editar.component.css'
})
export class DevicesEditarComponent implements OnInit {
  id!: number;
  nome = ''; identificador = ''; empresaId: number | null = null;
  latitude: number | null = null; longitude: number | null = null;
  empresas: Empresa[] = []; erro = '';

  constructor(
    private deviceService: DeviceService,
    private empresaService: EmpresaService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.empresaService.listar().subscribe({
      next: res => { this.empresas = [...res]; this.cdr.detectChanges(); }
    });
    this.deviceService.buscarPorId(this.id).subscribe({
      next: res => {
        this.nome = res.nome; this.identificador = res.identificador;
        this.empresaId = res.empresaId; this.latitude = res.latitude; this.longitude = res.longitude;
        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/admin/devices'])
    });
  }

  salvar() {
    if (!this.nome.trim() || !this.identificador.trim() || !this.empresaId) {
      this.erro = 'Nome, identificador e empresa são obrigatórios'; this.cdr.detectChanges(); return;
    }
    const dto: DeviceRequest = { nome: this.nome.trim(), identificador: this.identificador.trim(), empresaId: this.empresaId, latitude: this.latitude, longitude: this.longitude };
    this.deviceService.atualizar(this.id, dto).subscribe({
      next: () => this.router.navigate(['/admin/devices']),
      error: err => { this.erro = err.error?.mensagem ?? 'Erro ao salvar'; this.cdr.detectChanges(); }
    });
  }

  navegar(rota: string) { this.router.navigate([rota]); }
}