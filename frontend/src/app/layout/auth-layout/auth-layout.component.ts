import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gray-50">
      <router-outlet />
    </div>
  `,
})
export class AuthLayoutComponent {}
