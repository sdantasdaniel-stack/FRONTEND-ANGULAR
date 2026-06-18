import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',        loadComponent: () => import('./pages/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'empresas',         loadComponent: () => import('./pages/admin/empresas/empresas.component').then(m => m.EmpresasComponent) },
      { path: 'empresas/:id/editar', loadComponent: () => import('./pages/admin/empresas-editar/empresas-editar.component').then(m => m.EmpresasEditarComponent) },
      { path: 'devices',          loadComponent: () => import('./pages/admin/devices/devices.component').then(m => m.DevicesComponent) },
      { path: 'devices/:id/editar',  loadComponent: () => import('./pages/admin/devices-editar/devices-editar.component').then(m => m.DevicesEditarComponent) },
      { path: 'usuarios',         loadComponent: () => import('./pages/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
      { path: 'usuarios/:id/editar', loadComponent: () => import('./pages/admin/usuarios-editar/usuarios-editar.component').then(m => m.UsuariosEditarComponent) },
      { path: 'mapa',             loadComponent: () => import('./pages/mapa/mapa.component').then(m => m.MapaComponent) },
    ]
  },
  {
    path: 'user',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'devices', pathMatch: 'full' },
      { path: 'devices', loadComponent: () => import('./pages/user/meus-devices/meus-devices.component').then(m => m.MeusDevicesComponent) },
      { path: 'mapa',    loadComponent: () => import('./pages/mapa/mapa.component').then(m => m.MapaComponent) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
