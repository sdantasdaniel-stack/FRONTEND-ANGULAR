import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css',
})
export class Navbar implements OnInit {
  nomeUsuario = '';
  rotaAtual = '';

  private readonly links = [
    { label: 'Dashboard',  path: '/admin/dashboard' },
    { label: 'Empresas',   path: '/admin/empresas' },
    { label: 'Usuários',   path: '/admin/usuarios' },
    { label: 'Devices',    path: '/admin/devices' },
    { label: 'Importar',   path: '/admin/importar-devices' },
    { label: 'Mapa',       path: '/admin/mapa' },
  ];
  navLinks = this.links;

  constructor(private auth: AuthService, private router: Router) {}

  ngOnInit() {
    this.nomeUsuario = this.auth.getNome();
    this.rotaAtual = this.router.url;
    this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: NavigationEnd) => this.rotaAtual = e.urlAfterRedirects);
  }

  isAtivo(path: string): boolean {
    return this.rotaAtual.startsWith(path);
  }

  navegar(path: string) { this.router.navigate([path]); }
  logout() { this.auth.logout(); }
}