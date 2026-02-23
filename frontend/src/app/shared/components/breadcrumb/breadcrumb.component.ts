import { Component, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { TranslatePipe } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { Breadcrumb } from 'primeng/breadcrumb';

@Component({
  selector: 'app-breadcrumb',
  standalone: true,
  imports: [Breadcrumb],
  templateUrl: 'breadcrumb.component.html',
})
export class BreadcrumbComponent implements OnInit {
  items = signal<MenuItem[]>([]);
  home: MenuItem = { icon: 'pi pi-home', routerLink: '/app/warehouses' };

  private readonly router = inject(Router);

  ngOnInit(): void {
    this.buildBreadcrumbFromUrl(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(e => this.buildBreadcrumbFromUrl(e.urlAfterRedirects));
  }

  buildBreadcrumbFromUrl(url: string): void {
    const clean = url.split('?')[0].split('#')[0];
    const segments = clean.split('/').filter(Boolean);

    if (segments.length < 2) {
      this.items.set([]);
      return;
    }

    const feature = segments[1];

    if (feature === 'warehouses') {
      if (segments.length > 2) {
        this.items.set([
          { label: 'Almacén', routerLink: `/app/warehouses/${segments[2]}` },
        ]);
      } else {
        this.items.set([]);
      }
    } else if (feature === 'profile') {
      this.items.set([{ label: 'Mi Perfil', routerLink: '/app/profile' }]);
    } else {
      this.items.set([]);
    }
  }
}
