import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { EmpresaRequest } from '../../../core/models/empresa.model';

@Component({
  selector: 'app-empresas-editar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './empresas-editar.component.html',
  styleUrl: './empresas-editar.component.css',
})
export class EmpresasEditarComponent implements OnInit {
  private readonly API = 'http://localhost:8080';

  nomeUsuario = '';
  id!: number;
  nome = '';
  cnpj = '';
  email = '';
  erro = '';

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.nomeUsuario = this.auth.getNome();
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.http.get<any>(`${this.API}/empresas/${this.id}`).subscribe({
      next: res => {
        this.nome = res.nome;
        this.cnpj = res.cnpj;
        this.email = res.email;
        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/admin/empresas'])
    });
  }

  salvar() {
    if (!this.nome.trim()) { this.erro = 'O nome é obrigatório'; this.cdr.detectChanges(); return; }
    const cnpjLimpo = this.cnpj.replace(/\D/g, '');
    if (cnpjLimpo.length !== 14) { this.erro = 'O CNPJ deve ter 14 dígitos'; this.cdr.detectChanges(); return; }
    if (!this.email.trim() || !this.email.includes('@')) { this.erro = 'Digite um e-mail válido'; this.cdr.detectChanges(); return; }
    const dto: EmpresaRequest = { nome: this.nome.trim(), cnpj: this.cnpj.trim(), email: this.email.trim() };
    this.http.put(`${this.API}/empresas/${this.id}`, dto).subscribe({
      next: () => this.router.navigate(['/admin/empresas']),
      error: err => { this.erro = err.error?.mensagem ?? 'Erro ao salvar'; this.cdr.detectChanges(); }
    });
  }

  logout() { this.auth.logout(); }
  navegar(rota: string) { this.router.navigate([rota]); }
}