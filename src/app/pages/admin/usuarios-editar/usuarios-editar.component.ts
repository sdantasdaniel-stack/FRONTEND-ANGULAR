import { environment } from '../../../../environments/environment';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { Empresa } from '../../../core/models/empresa.model';
import { UsuarioRequest } from '../../../core/models/usuario.model';
import { Navbar } from '../../../shared/components/navbar/navbar.component';


@Component({
  selector: 'app-usuarios-editar',
  standalone: true,
  imports: [Navbar, FormsModule],
  templateUrl: './usuarios-editar.component.html',
  styleUrl: './usuarios-editar.component.css',
})
export class UsuariosEditarComponent implements OnInit {
  private readonly API = environment.apiUrl;

  nomeUsuario = '';
  id!: number;
  nome = '';
  email = '';
  senha = '';
  role: 'ADMIN' | 'USER' | '' = '';
  empresasIds: number[] = [];
  empresas: Empresa[] = [];
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

    this.http.get<Empresa[]>(`${this.API}/empresas`).subscribe({
      next: res => { this.empresas = [...res]; this.cdr.detectChanges(); },
      error: () => {}
    });

    this.http.get<any>(`${this.API}/usuarios/${this.id}`).subscribe({
      next: res => {
        this.nome = res.nome;
        this.email = res.email;
        this.role = res.role;
        this.empresasIds = [...(res.empresasIds ?? [])];
        this.cdr.detectChanges();
      },
      error: () => this.router.navigate(['/admin/usuarios'])
    });
  }

  toggleEmpresa(id: number) {
    const idx = this.empresasIds.indexOf(id);
    if (idx === -1) this.empresasIds.push(id);
    else this.empresasIds.splice(idx, 1);
  }

  empresaSelecionada(id: number): boolean {
    return this.empresasIds.includes(id);
  }

  salvar() {
    if (!this.nome.trim()) { this.erro = 'O nome é obrigatório'; this.cdr.detectChanges(); return; }
    if (!this.email.trim() || !this.email.includes('@')) { this.erro = 'Digite um e-mail válido'; this.cdr.detectChanges(); return; }
    if (!this.role) { this.erro = 'Selecione uma role'; this.cdr.detectChanges(); return; }
    if (this.empresasIds.length === 0) { this.erro = 'Selecione pelo menos uma empresa'; this.cdr.detectChanges(); return; }

    const dto: UsuarioRequest = {
      nome: this.nome.trim(),
      email: this.email.trim(),
      senha: this.senha,
      role: this.role,
      empresasIds: this.empresasIds
    };

    this.http.put(`${this.API}/usuarios/${this.id}`, dto).subscribe({
      next: () => this.router.navigate(['/admin/usuarios']),
      error: err => { this.erro = this.extrairErro(err); this.cdr.detectChanges(); }
    });
  }

  private extrairErro(err: any): string {
    return err?.error?.mensagem ?? err?.error?.message ?? err?.error?.erro ??
      (typeof err?.error === 'string' ? err.error : null) ?? 'Ocorreu um erro inesperado';
  }

  
}


