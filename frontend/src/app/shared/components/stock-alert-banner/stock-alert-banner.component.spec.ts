import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';

import { StockAlertBannerComponent } from './stock-alert-banner.component';
import type { Product } from '@shared/types';

const okProduct: Product = {
  id: 'prod-1',
  name: 'Product OK',
  sku: 'OK-001',
  quantity: 10,
  unit: 'unidades',
  minStock: 5,
  warehouseId: 'wh-1',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const lowProduct: Product = {
  id: 'prod-2',
  name: 'Product Low',
  sku: 'LOW-001',
  quantity: 3,
  unit: 'unidades',
  minStock: 5,
  warehouseId: 'wh-1',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const emptyProduct: Product = {
  id: 'prod-3',
  name: 'Product Empty',
  sku: 'EMPTY-001',
  quantity: 0,
  unit: 'unidades',
  minStock: 5,
  warehouseId: 'wh-1',
  createdAt: '2024-01-01T00:00:00.000Z',
};

describe('StockAlertBannerComponent', () => {
  let component: StockAlertBannerComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StockAlertBannerComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(StockAlertBannerComponent);
    component = fixture.componentInstance;
  });

  describe('hasAlerts', () => {
    it('should return false when all products have ok stock', () => {
      component.products = [okProduct];
      expect(component.hasAlerts()).toBe(false);
    });

    it('should return true when there are low-stock products', () => {
      component.products = [okProduct, lowProduct];
      expect(component.hasAlerts()).toBe(true);
    });

    it('should return true when there are out-of-stock products', () => {
      component.products = [okProduct, emptyProduct];
      expect(component.hasAlerts()).toBe(true);
    });

    it('should return false when products list is empty', () => {
      component.products = [];
      expect(component.hasAlerts()).toBe(false);
    });
  });

  describe('lowStockProducts', () => {
    it('should return only products with low stock', () => {
      component.products = [okProduct, lowProduct, emptyProduct];
      expect(component.lowStockProducts()).toHaveLength(1);
      expect(component.lowStockProducts()[0].id).toBe('prod-2');
    });

    it('should return empty array when no products have low stock', () => {
      component.products = [okProduct, emptyProduct];
      expect(component.lowStockProducts()).toHaveLength(0);
    });
  });

  describe('emptyProducts', () => {
    it('should return only products with zero stock', () => {
      component.products = [okProduct, lowProduct, emptyProduct];
      expect(component.emptyProducts()).toHaveLength(1);
      expect(component.emptyProducts()[0].id).toBe('prod-3');
    });

    it('should return empty array when no products are out of stock', () => {
      component.products = [okProduct, lowProduct];
      expect(component.emptyProducts()).toHaveLength(0);
    });
  });

  describe('alert counts', () => {
    it('should correctly count multiple low-stock products', () => {
      const anotherLow: Product = { ...lowProduct, id: 'prod-4', sku: 'LOW-002' };
      component.products = [okProduct, lowProduct, anotherLow];
      expect(component.lowStockProducts()).toHaveLength(2);
    });

    it('should correctly count multiple out-of-stock products', () => {
      const anotherEmpty: Product = { ...emptyProduct, id: 'prod-5', sku: 'EMPTY-002' };
      component.products = [okProduct, emptyProduct, anotherEmpty];
      expect(component.emptyProducts()).toHaveLength(2);
    });
  });
});
