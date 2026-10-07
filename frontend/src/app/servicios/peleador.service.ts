import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API, AuthService } from './auth.service';

export interface Peleador {
  id: number;
  nombre: string;
  gimnasio: string;
  apto_medico: boolean;
}

// Aquí están las 4 operaciones del CRUD (las llamadas al backend).
@Injectable({ providedIn: 'root' })
export class PeleadorService {
  private http = inject(HttpClient);
  private auth = inject(AuthService);
  private url = `${API}/peleadores/`;

  private opciones() { return { headers: this.auth.cabeceras() }; }

  obtenerTodos() { return this.http.get<Peleador[]>(this.url, this.opciones()); }                 // READ
  crear(nombre: string, gimnasio: string) {                                                        // CREATE
    return this.http.post<Peleador>(this.url, { nombre, gimnasio }, this.opciones());
  }
  actualizarEstado(id: number, apto_medico: boolean) {                                             // UPDATE
    return this.http.patch<Peleador>(`${this.url}${id}/`, { apto_medico }, this.opciones());
  }
  eliminar(id: number) { return this.http.delete(`${this.url}${id}/`, this.opciones()); }          // DELETE
}
