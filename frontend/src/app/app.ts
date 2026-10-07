import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Componente raíz: muestra la página que corresponda a la URL.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<div class="contenedor"><router-outlet /></div>`,
})
export class App {}
