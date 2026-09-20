import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Api } from './api';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('client');
  protected readonly message = signal('');
  private api = inject(Api);

  constructor() {
    this.api.getHello().subscribe((data) => {
      this.message.set(data.message);
    });
  }
}
