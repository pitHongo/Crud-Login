import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../servicios/auth.service';

// VISTA del login.
@Component({
  selector: 'app-login',
  imports: [FormsModule],
  template: `
    <h1>Torneo Regional de MMA</h1>
    <h3>Iniciar sesión</h3>

    @if (error) { <div class="error">{{ error }}</div> }

    <form class="formulario columna" (ngSubmit)="entrar()">
      <input name="usuario" [(ngModel)]="usuario" placeholder="Usuario">
      <input name="clave" type="password" [(ngModel)]="clave" placeholder="Contraseña">
      <button type="submit">Entrar</button>
    </form>
  `,
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  usuario = '';
  clave = '';
  error = '';

  entrar() {
    this.error = '';
    if (!this.usuario.trim() || !this.clave) {
      this.error = 'Completa usuario y contraseña.';
      return;
    }
    this.auth.login(this.usuario.trim(), this.clave).subscribe({
      next: () => this.router.navigate(['/peleadores']),
      error: e => this.error = e.error?.detail ?? 'No se pudo conectar con el servidor.',
    });
  }
}
