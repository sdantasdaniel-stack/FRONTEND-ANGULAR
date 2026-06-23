import { environment } from '../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Empresa, EmpresaRequest } from '../../../core/models/empresa.model';
import { Navbar } from '../../../shared/components/navbar/navbar.component';


@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [Navbar, FormsModule],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.css'
})
export class EmpresasComponent implements OnInit {

  private readonly API = environment.apiUrl;

  nomeUsuario = '';
  empresas: Empresa[] = [];
  formAberto = false;

  fNome = '';
  fCnpj = '';
  fEmail = '';

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
    this.http.get<Empresa[]>(`${this.API}/empresas`).subscribe({
      next: res => {
        this.empresas = [...res];
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('>>> erro:', err);
        this.mostrarToast('Erro ao carregar empresas');
      }
    });
  }

  abrirForm() { this.formAberto = true; }
  fecharForm() { this.formAberto = false; this.limparForm(); }

  cadastrar() {
    if (!this.fNome.trim()) { this.mostrarToast('O nome é obrigatório'); return; }
    const cnpjLimpo = this.fCnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) { this.mostrarToast('O CNPJ deve ter 14 dígitos'); return; }
    if (!this.fEmail.trim() || !this.fEmail.includes('@')) { this.mostrarToast('Digite um e-mail válido'); return; }
    const dto: EmpresaRequest = { nome: this.fNome.trim(), cnpj: this.fCnpj.trim(), email: this.fEmail.trim() };
    this.http.post<Empresa>(`${this.API}/empresas`, dto).subscribe({
      next: () => { this.carregar(); this.fecharForm(); this.mostrarToast('Empresa cadastrada com sucesso'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao cadastrar')
    });
  }

  desativar(empresa: Empresa) {
    this.http.delete(`${this.API}/empresas/${empresa.id}`).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Empresa desativada'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao desativar')
    });
  }

  reativar(empresa: Empresa) {
    this.http.patch(`${this.API}/empresas/${empresa.id}/reativar`, {}).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Empresa reativada'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao reativar')
    });
  }

  deletar(empresa: Empresa) {
    if (!confirm(`Deletar "${empresa.nome}" permanentemente? Esta ação não pode ser desfeita.`)) return;
    this.http.delete(`${this.API}/empresas/${empresa.id}/deletar`).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Empresa deletada'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao deletar')
    });
  }

  editar(empresa: Empresa) {
    this.router.navigate(['/admin/empresas', empresa.id, 'editar']);
  }

  private limparForm() { this.fNome = ''; this.fCnpj = ''; this.fEmail = ''; }

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

