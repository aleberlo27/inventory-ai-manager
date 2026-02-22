import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Toolbar } from 'primeng/toolbar';
import { Avatar } from 'primeng/avatar';
import { Button } from 'primeng/button';
import { Menu } from 'primeng/menu';

import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [TranslatePipe, RouterLink, Toolbar, Avatar, Button, Menu],
  templateUrl: 'topbar.component.html',
})
export class TopbarComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  currentUser = this.authService.currentUser;

  userInitials = computed(() => {
    const name = this.currentUser()?.name ?? '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  menuItems: MenuItem[] = [
    { label: 'Mi Perfil', icon: 'pi pi-user', routerLink: '/app/profile' },
    { separator: true },
    { label: 'Cerrar Sesión', icon: 'pi pi-sign-out', command: () => this.logout() },
  ];

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
