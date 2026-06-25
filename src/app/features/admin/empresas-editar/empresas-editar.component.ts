import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Navbar } from '../../../shared/components/navbar/navbar.component';
import { EmpresaService } from '../../../core/services/empresa.service';
import { EmpresaRequest } from '../../../core/models/empresa.model';

@Component({
  selector: 'app-empresas-editar',
  standalone: true,
  imports: [Navbar, FormsModule],
  templateUrl: './empresas-editar.component.html',
  styleUrl: './empresas-editar.component.css'
})
export class EmpresasEditarComponent implements OnInit {
  id!: number;
  nome = ''; cnpj = ''; email = ''; erro = '';

  constructor(
    private empresaService: EmpresaService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.empresaService.buscarPorId(this.id).subscribe({
      next: res => { this.nome = res.nome; this.cnpj = res.cnpj; this.email = res.email; this.cdr.detectChanges(); },
      error: () => this.router.navigate(['/admin/empresas'])
    });
  }

  salvar() {
    if (!this.nome.trim()) { this.erro = 'O nome é obrigatório'; this.cdr.detectChanges(); return; }
    if (this.cnpj.replace(/\D/g, '').length !== 14) { this.erro = 'CNPJ deve ter 14 dígitos'; this.cdr.detectChanges(); return; }
    if (!this.email.includes('@')) { this.erro = 'E-mail inválido'; this.cdr.detectChanges(); return; }
    const dto: EmpresaRequest = { nome: this.nome.trim(), cnpj: this.cnpj.trim(), email: this.email.trim() };
    this.empresaService.atualizar(this.id, dto).subscribe({
      next: () => this.router.navigate(['/admin/empresas']),
      error: err => { this.erro = err.error?.mensagem ?? 'Erro ao salvar'; this.cdr.detectChanges(); }
    });
  }

  navegar(rota: string) { this.router.navigate([rota]); }
}

