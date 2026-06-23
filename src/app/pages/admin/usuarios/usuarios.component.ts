import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar.component';
import { UsuarioService } from '../../../core/services/usuario.service';
import { EmpresaService } from '../../../core/services/empresa.service';
import { Usuario, UsuarioRequest } from '../../../core/models/usuario.model';
import { Empresa } from '../../../core/models/empresa.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [Navbar, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})
export class UsuariosComponent implements OnInit {
  usuarios: Usuario[] = [];
  empresas: Empresa[] = [];
  formAberto = false;
  fNome = ''; fEmail = ''; fSenha = ''; fRole: 'ADMIN' | 'USER' | '' = ''; fEmpresasIds: number[] = [];
  toast = { visivel: false, mensagem: '' };
  private toastTimer: any;

  constructor(
    private usuarioService: UsuarioService,
    private empresaService: EmpresaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.usuarioService.listar().subscribe({
      next: res => { this.usuarios = [...res]; this.cdr.detectChanges(); },
      error: () => this.mostrarToast('Erro ao carregar usuários')
    });
    this.empresaService.listar().subscribe({
      next: res => { this.empresas = [...res]; this.cdr.detectChanges(); }
    });
  }

  abrirForm() { this.formAberto = true; }
  fecharForm() { this.formAberto = false; this.limparForm(); }

  toggleEmpresa(id: number) {
    const idx = this.fEmpresasIds.indexOf(id);
    if (idx === -1) this.fEmpresasIds.push(id); else this.fEmpresasIds.splice(idx, 1);
  }
  empresaSelecionada(id: number): boolean { return this.fEmpresasIds.includes(id); }

  cadastrar() {
    if (!this.fNome.trim()) { this.mostrarToast('O nome é obrigatório'); return; }
    if (!this.fEmail.includes('@')) { this.mostrarToast('E-mail inválido'); return; }
    if (!this.fSenha.trim()) { this.mostrarToast('A senha é obrigatória'); return; }
    if (!this.fRole) { this.mostrarToast('Selecione uma role'); return; }
    if (!this.fEmpresasIds.length) { this.mostrarToast('Selecione pelo menos uma empresa'); return; }
    const dto: UsuarioRequest = { nome: this.fNome.trim(), email: this.fEmail.trim(), senha: this.fSenha, role: this.fRole, empresasIds: this.fEmpresasIds };
    this.usuarioService.criar(dto).subscribe({
      next: () => { this.carregar(); this.fecharForm(); this.mostrarToast('Usuário cadastrado com sucesso'); },
      error: err => this.mostrarToast(this.extrairErro(err))
    });
  }

  desativar(u: Usuario) {
    this.usuarioService.desativar(u.id).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Usuário desativado'); },
      error: err => this.mostrarToast(this.extrairErro(err))
    });
  }

  reativar(u: Usuario) {
    this.usuarioService.reativar(u.id).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Usuário reativado'); },
      error: err => this.mostrarToast(this.extrairErro(err))
    });
  }

  deletar(u: Usuario) {
    if (!confirm(`Deletar "${u.nome}" permanentemente?`)) return;
    this.usuarioService.deletar(u.id).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Usuário deletado'); },
      error: err => this.mostrarToast(this.extrairErro(err))
    });
  }

  editar(u: Usuario) { this.router.navigate(['/admin/usuarios', u.id, 'editar']); }
  nomeEmpresas(ids: number[]): string { return ids.map(id => this.empresas.find(e => e.id === id)?.nome ?? `#${id}`).join(', '); }

  private extrairErro(err: any): string {
    return err?.error?.mensagem ?? err?.error?.message ?? err?.error?.erro ?? 'Erro inesperado';
  }
  private limparForm() { this.fNome = ''; this.fEmail = ''; this.fSenha = ''; this.fRole = ''; this.fEmpresasIds = []; }

  mostrarToast(mensagem: string) {
    this.toast = { visivel: true, mensagem };
    this.cdr.detectChanges();
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast.visivel = false; this.cdr.detectChanges(); }, 3000);
  }
}