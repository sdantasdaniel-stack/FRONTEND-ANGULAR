import { Component } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
})
export class LoginComponent {
  email = '';
  senha = '';
  erro = false;
  carregando = false;

  constructor(
    private auth: AuthService,
    private router: Router,
  ) {
    // se já estiver logado, redireciona direto
    if (this.auth.isLogado()) {
      this.redirecionar();
    }
  }

  entrar() {
    if (!this.email || !this.senha) {
      this.erro = true;
      return;
    }
    this.carregando = true;
    this.erro = false;

    this.auth.login({ email: this.email, senha: this.senha }).subscribe({
      next: () => this.redirecionar(),
      error: () => {
        this.erro = true;
        this.carregando = false;
      },
    });
  }

  private redirecionar() {
    if (this.auth.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      this.router.navigate(['/user/devices']);
    }
  }
}

