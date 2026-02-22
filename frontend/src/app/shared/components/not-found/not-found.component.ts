import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [TranslatePipe, Button],
  templateUrl: 'not-found.component.html',
})
export class NotFoundComponent {
  private readonly router = inject(Router);

  goHome(): void {
    this.router.navigate(['/app/warehouses']);
  }
}
