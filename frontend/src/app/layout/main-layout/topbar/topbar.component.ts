import { Component, computed, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { AuthService } from '../../../features/auth/services/auth.service';

@Component({
  selector: 'app-topbar',
  imports: [TranslateModule, RouterModule, ToolbarModule, AvatarModule, ButtonModule, MenuModule],
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

  get showWarehousesButton(): boolean {
    return this.router.url !== '/app/warehouses';
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
