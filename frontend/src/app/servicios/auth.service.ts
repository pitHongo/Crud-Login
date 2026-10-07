import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

export const API = 'http://localhost:8000/api';

// Maneja el login, el logout y el token de la sesión.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(username: string, password: string) {
    return this.http
      .post<{ token: string; username: string }>(`${API}/login/`, { username, password })
      .pipe(tap(res => {
        localStorage.setItem('token', res.token);      // guardamos el token
        localStorage.setItem('usuario', res.username);
      }));
  }

  logout() {
    const salir = () => this.cerrarSesionLocal();
    this.http.post(`${API}/logout/`, {}, { headers: this.cabeceras() })
      .subscribe({ next: salir, error: salir });
  }

  cerrarSesionLocal() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    this.router.navigate(['/login']);
  }

  estaLogueado(): boolean { return !!localStorage.getItem('token'); }
  usuario(): string { return localStorage.getItem('usuario') ?? ''; }

  // Cabecera que prueba al backend que ya iniciamos sesión.
  cabeceras(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Token ${localStorage.getItem('token')}` });
  }
}
