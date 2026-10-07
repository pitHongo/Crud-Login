import { Routes } from '@angular/router';
import { LoginComponent } from './paginas/login/login.component';
import { PeleadoresComponent } from './paginas/peleadores/peleadores.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  // Ruta protegida: sin sesión, el guard redirige a /login.
  { path: 'peleadores', component: PeleadoresComponent, canActivate: [authGuard] },
  { path: '', redirectTo: 'peleadores', pathMatch: 'full' },
  { path: '**', redirectTo: 'peleadores' },
];
