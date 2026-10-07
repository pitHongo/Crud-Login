import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../servicios/auth.service';
import { Peleador, PeleadorService } from '../../servicios/peleador.service';

// VISTA + lógica del CRUD (sección protegida).
@Component({
  selector: 'app-peleadores',
  imports: [FormsModule],
  template: `
    <div class="barra">
      <span>👤 {{ auth.usuario() }}</span>
      <button class="btn-salir" (click)="auth.logout()">Cerrar sesión</button>
    </div>

    <h1>Torneo Regional de MMA</h1>

    @if (error) { <div class="error">{{ error }}</div> }

    <form class="formulario" (ngSubmit)="inscribir()">
      <input name="nombre" [(ngModel)]="nombre" placeholder="Nombre del peleador">
      <input name="gimnasio" [(ngModel)]="gimnasio" placeholder="Gimnasio o Club">
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
            <button class="btn-eliminar" (click)="retirar(p)">Retirar</button>
          </div>
        </li>
      } @empty {
        <li class="vacio">No hay competidores inscritos aún.</li>
      }
    </ul>
  `,
})
export class PeleadoresComponent implements OnInit {
  auth = inject(AuthService);
  private servicio = inject(PeleadorService);

  peleadores: Peleador[] = [];
  nombre = '';
  gimnasio = '';
  error = '';

  ngOnInit() { this.cargar(); }

  cargar() {                                   // READ
    this.servicio.obtenerTodos().subscribe({
      next: datos => this.peleadores = datos,
      error: e => this.fallo(e),
    });
  }

  inscribir() {                                // CREATE
    this.error = '';
    if (!this.nombre.trim() || !this.gimnasio.trim()) {
      this.error = 'Completa todos los campos para inscribir al peleador.';
      return;
    }
    this.servicio.crear(this.nombre.trim(), this.gimnasio.trim()).subscribe({
      next: () => { this.nombre = ''; this.gimnasio = ''; this.cargar(); },
      error: e => this.fallo(e),
    });
  }

  cambiarEstado(p: Peleador) {                 // UPDATE
    this.servicio.actualizarEstado(p.id, !p.apto_medico).subscribe({
      next: () => this.cargar(),
      error: e => this.fallo(e),
    });
  }

  retirar(p: Peleador) {                       // DELETE
    this.servicio.eliminar(p.id).subscribe({
      next: () => this.cargar(),
      error: e => this.fallo(e),
    });
  }

  private fallo(e: { status: number }) {
    // Si el backend dice 401, la sesión no es válida: volvemos al login.
    if (e.status === 401) this.auth.cerrarSesionLocal();
    else this.error = 'Ocurrió un error con el servidor.';
  }
}
