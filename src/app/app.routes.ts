import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',           loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'empresas',            loadComponent: () => import('./features/admin/empresas/empresas.component').then(m => m.EmpresasComponent) },
      { path: 'empresas/:id/editar', loadComponent: () => import('./features/admin/empresas-editar/empresas-editar.component').then(m => m.EmpresasEditarComponent) },
      { path: 'devices',             loadComponent: () => import('./features/admin/devices/devices.component').then(m => m.DevicesComponent) },
      { path: 'devices/:id/editar',  loadComponent: () => import('./features/admin/devices-editar/devices-editar.component').then(m => m.DevicesEditarComponent) },
      { path: 'usuarios',            loadComponent: () => import('./features/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent) },
      { path: 'usuarios/:id/editar', loadComponent: () => import('./features/admin/usuarios-editar/usuarios-editar.component').then(m => m.UsuariosEditarComponent) },
      { path: 'mapa',                loadComponent: () => import('./features/mapa/mapa.component').then(m => m.MapaComponent) },
      { path: 'importar-devices',    loadComponent: () => import('./features/admin/importar-devices/importar-devices.component').then(m => m.ImportarDevicesComponent) },
    ]
  },
  {
    path: 'user',
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'devices', pathMatch: 'full' },
      { path: 'devices', loadComponent: () => import('./features/user/meus-devices/meus-devices.component').then(m => m.MeusDevicesComponent) },
      { path: 'mapa',    loadComponent: () => import('./features/mapa/mapa.component').then(m => m.MapaComponent) },
    ]
  },
  { path: '**', redirectTo: 'login' }
];
