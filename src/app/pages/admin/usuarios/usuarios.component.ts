import { environment } from '../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Usuario, UsuarioRequest } from '../../../core/models/usuario.model';
import { Empresa } from '../../../core/models/empresa.model';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css',
})
export class UsuariosComponent implements OnInit {
  private readonly API = environment.apiUrl;

  nomeUsuario = '';
  usuarios: Usuario[] = [];
  empresas: Empresa[] = [];
  formAberto = false;

  fNome = '';
  fEmail = '';
  fSenha = '';
  fRole: 'ADMIN' | 'USER' | '' = '';
  fEmpresasIds: number[] = [];

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
    this.carregar();
  }

  carregar() {
    this.http.get<Usuario[]>(`${this.API}/usuarios`).subscribe({
      next: res => { this.usuarios = [...res]; this.cdr.detectChanges(); },
      error: () => this.mostrarToast('Erro ao carregar usuários')
    });
    this.http.get<Empresa[]>(`${this.API}/empresas`).subscribe({
      next: res => { this.empresas = [...res]; this.cdr.detectChanges(); },
      error: () => {}
    });
  }

  abrirForm() { this.formAberto = true; }
  fecharForm() { this.formAberto = false; this.limparForm(); }

  toggleEmpresa(id: number) {
    const idx = this.fEmpresasIds.indexOf(id);
    if (idx === -1) this.fEmpresasIds.push(id);
    else this.fEmpresasIds.splice(idx, 1);
  }

  empresaSelecionada(id: number): boolean {
    return this.fEmpresasIds.includes(id);
  }

  cadastrar() {
    if (!this.fNome.trim()) { this.mostrarToast('O nome é obrigatório'); return; }
    if (!this.fEmail.trim() || !this.fEmail.includes('@')) { this.mostrarToast('Digite um e-mail válido'); return; }
    if (!this.fSenha.trim()) { this.mostrarToast('A senha é obrigatória'); return; }
    if (!this.fRole) { this.mostrarToast('Selecione uma role'); return; }
    if (this.fEmpresasIds.length === 0) { this.mostrarToast('Selecione pelo menos uma empresa'); return; }

    const dto: UsuarioRequest = {
      nome: this.fNome.trim(),
      email: this.fEmail.trim(),
      senha: this.fSenha,
      role: this.fRole,
      empresasIds: this.fEmpresasIds
    };

    this.http.post<Usuario>(`${this.API}/usuarios`, dto).subscribe({
      next: () => { this.carregar(); this.fecharForm(); this.mostrarToast('Usuário cadastrado com sucesso'); },
      error: err => this.mostrarToast(this.extrairErro(err))
    });
  }

  desativar(usuario: Usuario) {
    this.http.delete(`${this.API}/usuarios/${usuario.id}`).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Usuário desativado'); },
      error: err => this.mostrarToast(this.extrairErro(err))
    });
  }

  reativar(usuario: Usuario) {
    this.http.patch(`${this.API}/usuarios/${usuario.id}/reativar`, {}).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Usuário reativado'); },
      error: err => this.mostrarToast(this.extrairErro(err))
    });
  }

  deletar(usuario: Usuario) {
    if (!confirm(`Deletar "${usuario.nome}" permanentemente? Esta ação não pode ser desfeita.`)) return;
    this.http.delete(`${this.API}/usuarios/${usuario.id}/deletar`).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Usuário deletado'); },
      error: err => this.mostrarToast(this.extrairErro(err))
    });
  }

  editar(usuario: Usuario) { this.router.navigate(['/admin/usuarios', usuario.id, 'editar']); }

  nomeEmpresas(ids: number[]): string {
    return ids.map(id => this.empresas.find(e => e.id === id)?.nome ?? `#${id}`).join(', ');
  }

  private extrairErro(err: any): string {
    return err?.error?.mensagem ?? err?.error?.message ?? err?.error?.erro ??
      (typeof err?.error === 'string' ? err.error : null) ?? 'Ocorreu um erro inesperado';
  }

  private limparForm() {
    this.fNome = ''; this.fEmail = ''; this.fSenha = ''; this.fRole = ''; this.fEmpresasIds = [];
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
  
  logout() { this.auth.logout(); }
  navegar(rota: string) { this.router.navigate([rota]); }
}

