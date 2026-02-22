import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';

import { BreadcrumbComponent } from './breadcrumb.component';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let mockRouter: { url: string; events: Subject<unknown>; navigate: jest.Mock };

  beforeEach(() => {
    mockRouter = {
      url: '/app/warehouses',
      events: new Subject(),
      navigate: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [BreadcrumbComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(BreadcrumbComponent);
    component = fixture.componentInstance;
  });

  describe('home item', () => {
    it('should have home icon defined', () => {
      expect(component.home.icon).toBe('pi pi-home');
    });

    it('should link home to /app/warehouses', () => {
      expect(component.home.routerLink).toBe('/app/warehouses');
    });
  });

  describe('buildBreadcrumbFromUrl', () => {
    it('should have empty items on /app/warehouses route', () => {
      component.buildBreadcrumbFromUrl('/app/warehouses');
      expect(component.items()).toHaveLength(0);
    });

    it('should have one item on /app/warehouses/:id route', () => {
      component.buildBreadcrumbFromUrl('/app/warehouses/wh-abc-123');
      expect(component.items()).toHaveLength(1);
    });

    it('should set the warehouse detail item label', () => {
      component.buildBreadcrumbFromUrl('/app/warehouses/wh-1');
      expect(component.items()[0].label).toBe('Almacén');
    });

    it('should set the warehouse detail item routerLink', () => {
      component.buildBreadcrumbFromUrl('/app/warehouses/wh-1');
      expect(component.items()[0].routerLink).toBe('/app/warehouses/wh-1');
    });

    it('should have Mi Perfil item on /app/profile route', () => {
      component.buildBreadcrumbFromUrl('/app/profile');
      expect(component.items()).toHaveLength(1);
      expect(component.items()[0].label).toBe('Mi Perfil');
    });

    it('should have empty items for unknown routes', () => {
      component.buildBreadcrumbFromUrl('/app/unknown');
      expect(component.items()).toHaveLength(0);
    });

    it('should ignore query params when building breadcrumb', () => {
      component.buildBreadcrumbFromUrl('/app/warehouses?page=1');
      expect(component.items()).toHaveLength(0);
    });
  });

  describe('ngOnInit', () => {
    it('should build breadcrumb from router.url on init', () => {
      mockRouter.url = '/app/warehouses/wh-1';
      component.ngOnInit();
      expect(component.items()).toHaveLength(1);
    });
  });
});
