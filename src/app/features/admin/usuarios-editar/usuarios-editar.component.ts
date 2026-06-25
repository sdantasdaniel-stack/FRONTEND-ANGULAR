import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar.component';
import { UsuarioService } from '../../../core/services/usuario.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { UsuarioRequest } from '../../../core/models/usuario.model';
import { Empresa } from '../../../core/models/empresa.model';

@Component({
  selector: 'app-usuarios-editar',
  standalone: true,
  imports: [Navbar, FormsModule],
  templateUrl: './usuarios-editar.component.html',
  styleUrl: './usuarios-editar.component.css'
})
export class UsuariosEditarComponent implements OnInit {
  id!: number;
  nome = ''; email = ''; senha = ''; role: 'ADMIN' | 'USER' | '' = '';
  empresasIds: number[] = []; empresas: Empresa[] = []; erro = '';

  constructor(
    private usuarioService: UsuarioService,
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
    this.usuarioService.buscarPorId(this.id).subscribe({
      next: res => {
        this.nome = res.nome; this.email = res.email;
        this.role = res.role; this.empresasIds = [...(res.empresasIds ?? [])];
        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/admin/usuarios'])
    });
  }

  toggleEmpresa(id: number) {
    const idx = this.empresasIds.indexOf(id);
    if (idx === -1) this.empresasIds.push(id); else this.empresasIds.splice(idx, 1);
  }
  empresaSelecionada(id: number): boolean { return this.empresasIds.includes(id); }

  salvar() {
    if (!this.nome.trim()) { this.erro = 'O nome é obrigatório'; this.cdr.detectChanges(); return; }
    if (!this.email.includes('@')) { this.erro = 'E-mail inválido'; this.cdr.detectChanges(); return; }
    if (!this.role) { this.erro = 'Selecione uma role'; this.cdr.detectChanges(); return; }
    if (!this.empresasIds.length) { this.erro = 'Selecione pelo menos uma empresa'; this.cdr.detectChanges(); return; }
    const dto: UsuarioRequest = { nome: this.nome.trim(), email: this.email.trim(), senha: this.senha, role: this.role, empresasIds: this.empresasIds };
    this.usuarioService.atualizar(this.id, dto).subscribe({
      next: () => this.router.navigate(['/admin/usuarios']),
      error: err => { this.erro = err?.error?.mensagem ?? 'Erro ao salvar'; this.cdr.detectChanges(); }
    });
  }

  navegar(rota: string) { this.router.navigate([rota]); }
}
