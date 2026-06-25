import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar.component';
import { EmpresaService } from '../../../core/services/empresa.service';
import { Empresa, EmpresaRequest } from '../../../core/models/empresa.model';

@Component({
  selector: 'app-empresas',
  standalone: true,
  imports: [Navbar, FormsModule],
  templateUrl: './empresas.component.html',
  styleUrl: './empresas.component.css'
})
export class EmpresasComponent implements OnInit {
  empresas: Empresa[] = [];
  formAberto = false;
  fNome = ''; fCnpj = ''; fEmail = '';
  toast = { visivel: false, mensagem: '' };
  private toastTimer: any;

  constructor(
    private empresaService: EmpresaService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() { this.carregar(); }

  carregar() {
    this.empresaService.listar().subscribe({
      next: res => { this.empresas = [...res]; this.cdr.detectChanges(); },
      error: () => this.mostrarToast('Erro ao carregar empresas')
    });
  }

  abrirForm() { this.formAberto = true; }
  fecharForm() { this.formAberto = false; this.limparForm(); }

  cadastrar() {
    if (!this.fNome.trim()) { this.mostrarToast('O nome é obrigatório'); return; }
    if (this.fCnpj.replace(/\D/g, '').length !== 14) { this.mostrarToast('O CNPJ deve ter 14 dígitos'); return; }
    if (!this.fEmail.includes('@')) { this.mostrarToast('Digite um e-mail válido'); return; }
    const dto: EmpresaRequest = { nome: this.fNome.trim(), cnpj: this.fCnpj.trim(), email: this.fEmail.trim() };
    this.empresaService.criar(dto).subscribe({
      next: () => { this.carregar(); this.fecharForm(); this.mostrarToast('Empresa cadastrada com sucesso'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao cadastrar')
    });
  }

  desativar(e: Empresa) {
    this.empresaService.desativar(e.id).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Empresa desativada'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao desativar')
    });
  }

  reativar(e: Empresa) {
    this.empresaService.reativar(e.id).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Empresa reativada'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao reativar')
    });
  }

  deletar(e: Empresa) {
    if (!confirm(`Deletar "${e.nome}" permanentemente?`)) return;
    this.empresaService.deletar(e.id).subscribe({
      next: () => { this.carregar(); this.mostrarToast('Empresa deletada'); },
      error: err => this.mostrarToast(err.error?.mensagem ?? 'Erro ao deletar')
    });
  }

  editar(e: Empresa) { this.router.navigate(['/admin/empresas', e.id, 'editar']); }

  private limparForm() { this.fNome = ''; this.fCnpj = ''; this.fEmail = ''; }

  mostrarToast(mensagem: string) {
    this.toast = { visivel: true, mensagem };
    this.cdr.detectChanges();
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toast.visivel = false; this.cdr.detectChanges(); }, 3000);
  }
}