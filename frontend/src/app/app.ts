import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const API = 'http://localhost:8000/api';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  template: `
  <div class="contenedor">
    <h1>Torneo Regional de MMA</h1>

    @if (error) { <div class="error">{{ error }}</div> }

    <!-- ========== VISTA 1: LOGIN (se ve si NO hay sesión) ========== -->
    @if (!token) {
      <h3>Iniciar sesión</h3>
      <form class="formulario columna" (ngSubmit)="login()">
        <input name="usuario" [(ngModel)]="usuario" placeholder="Usuario">
        <input name="clave" type="password" [(ngModel)]="clave" placeholder="Contraseña">
        <button type="submit">Entrar</button>
      </form>
    }

    <!-- ========== VISTA 2: CRUD (solo si hay sesión) ========== -->
    @else {
      <div class="barra">
        <span>👤 {{ usuario }}</span>
        <button class="btn-salir" (click)="salir()">Cerrar sesión</button>
      </div>

      <form class="formulario" (ngSubmit)="crear()">
        <input name="nombre" [(ngModel)]="nombre" placeholder="Nombre del peleador">
        <input name="gym" [(ngModel)]="gym" placeholder="Gimnasio o Club">
        <button type="submit">Inscribir</button>
      </form>

      <h3>Lista Oficial de Competidores</h3>
      <ul>
        @for (p of peleadores; track p.id) {
          <li [class.baja-medica]="!p.apto_medico">
            <div class="info-peleador">
              <span class="nombre">{{ p.nombre }}</span>
              <span class="gym">Gym: {{ p.gimnasio }} | Estado: {{ p.apto_medico ? '🟢 Apto' : '🔴 Baja Médica' }}</span>
            </div>
            <div class="acciones">
              <button class="btn-estado" (click)="cambiarEstado(p)">Estado Médico</button>
              <button class="btn-eliminar" (click)="eliminar(p)">Retirar</button>
            </div>
          </li>
        } @empty {
          <li class="vacio">No hay competidores inscritos aún.</li>
        }
      </ul>
    }
  </div>
  `,
})
export class App {
  token = localStorage.getItem('token');       // si hay token, hay sesión
  usuario = localStorage.getItem('usuario') ?? '';
  clave = '';
  nombre = '';
  gym = '';
  error = '';
  peleadores: any[] = [];

  constructor(private http: HttpClient) {
    if (this.token) this.leer();
  }

  // Cabecera que le demuestra al backend que ya iniciamos sesión
  private cabeceras() {
    return { headers: new HttpHeaders({ Authorization: `Token ${this.token}` }) };
  }

  // ---------- LOGIN / LOGOUT ----------
  login() {
    this.error = '';
    this.http.post<any>(`${API}/login/`, { username: this.usuario, password: this.clave }).subscribe({
      next: res => {
        this.token = res.token;
        localStorage.setItem('token', res.token);
        localStorage.setItem('usuario', res.username);
        this.clave = '';
        this.leer();
      },
      error: e => this.error = e.error?.detail ?? 'No se pudo conectar con el servidor.',
    });
  }

  salir() {
    localStorage.clear();
    this.token = null;
    this.peleadores = [];
  }

  // ---------- CRUD ----------
  leer() {                                     // READ
    this.http.get<any[]>(`${API}/peleadores/`, this.cabeceras()).subscribe({
      next: datos => this.peleadores = datos,
      error: () => this.salir(),               // 401: sesión inválida
    });
  }

  crear() {                                    // CREATE
    if (!this.nombre.trim() || !this.gym.trim()) {
      this.error = 'Completa todos los campos para inscribir al peleador.';
      return;
    }
    this.error = '';
    this.http.post(`${API}/peleadores/`, { nombre: this.nombre, gimnasio: this.gym }, this.cabeceras())
      .subscribe(() => { this.nombre = ''; this.gym = ''; this.leer(); });
  }

  cambiarEstado(p: any) {                      // UPDATE
    this.http.patch(`${API}/peleadores/${p.id}/`, { apto_medico: !p.apto_medico }, this.cabeceras())
      .subscribe(() => this.leer());
  }

  eliminar(p: any) {                           // DELETE
    this.http.delete(`${API}/peleadores/${p.id}/`, this.cabeceras())
      .subscribe(() => this.leer());
  }
}
