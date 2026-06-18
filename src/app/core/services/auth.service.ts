import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { LoginRequest, LoginResponse, UsuarioLogado } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly API = 'http://localhost:8080';
  private readonly KEY = 'usuario_logado';

  constructor(private http: HttpClient, private router: Router) {}

  login(body: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.API}/auth/login`, body).pipe(
      tap(res => {
        // decodifica a role do token JWT sem biblioteca externa
        const payload = JSON.parse(atob(res.token.split('.')[1]));
        const usuario: UsuarioLogado = {
          nome: res.nome,
          token: res.token,
          role: payload.role,
          empresas: res.empresas
        };
        localStorage.setItem(this.KEY, JSON.stringify(usuario));
      })
    );
  }

  logout(): void {
    localStorage.removeItem(this.KEY);
    this.router.navigate(['/login']);
  }

  getUsuario(): UsuarioLogado | null {
    const raw = localStorage.getItem(this.KEY);
    return raw ? JSON.parse(raw) : null;
  }

  getToken(): string | null {
    return this.getUsuario()?.token ?? null;
  }

  isLogado(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // exp é em segundos, Date.now() em milissegundos
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  isAdmin(): boolean {
    return this.getUsuario()?.role === 'ADMIN';
  }

  getNome(): string {
    return this.getUsuario()?.nome ?? '';
  }

  // atualiza o token quando o backend devolve um renovado no header Authorization
  atualizarToken(novoToken: string): void {
    const usuario = this.getUsuario();
    if (usuario) {
      usuario.token = novoToken;
      localStorage.setItem(this.KEY, JSON.stringify(usuario));
    }
  }
}
