import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';

import { ProductCardComponent } from './product-card.component';
import type { Product } from '@shared/types';

const mockProduct: Product = {
  id: 'prod-1',
  name: 'Test Product',
  sku: 'PROD-001',
  quantity: 10,
  unit: 'unidades',
  category: 'Electronics',
  minStock: 5,
  warehouseId: 'wh-1',
  createdAt: '2024-01-01T00:00:00.000Z',
};

const lowStockProduct: Product = { ...mockProduct, quantity: 3, minStock: 5 };
const emptyStockProduct: Product = { ...mockProduct, quantity: 0, minStock: 5 };

describe('ProductCardComponent', () => {
  let component: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductCardComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(ProductCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('product', mockProduct);
  });

  describe('product data', () => {
    it('should have the product name accessible', () => {
      expect(component.product().name).toBe('Test Product');
    });

    it('should have the product SKU accessible', () => {
      expect(component.product().sku).toBe('PROD-001');
    });

    it('should have the correct quantity and unit', () => {
      expect(component.product().quantity).toBe(10);
      expect(component.product().unit).toBe('unidades');
    });
  });

  describe('stockStatus computed', () => {
    it('should return ok when quantity is above minStock', () => {
      fixture.componentRef.setInput('product', mockProduct);
      expect(component.stockStatus()).toBe('ok');
    });

    it('should return low when quantity is at or below minStock', () => {
      fixture.componentRef.setInput('product', lowStockProduct);
      expect(component.stockStatus()).toBe('low');
    });

    it('should return empty when quantity is 0', () => {
      fixture.componentRef.setInput('product', emptyStockProduct);
      expect(component.stockStatus()).toBe('empty');
    });
  });

  describe('statusLabel computed', () => {
    it('should return "En stock" for ok status', () => {
      fixture.componentRef.setInput('product', mockProduct);
      expect(component.statusLabel()).toBe('En stock');
    });

    it('should return "Stock bajo" for low status', () => {
      fixture.componentRef.setInput('product', lowStockProduct);
      expect(component.statusLabel()).toBe('Stock bajo');
    });

    it('should return "Sin stock" for empty status', () => {
      fixture.componentRef.setInput('product', emptyStockProduct);
      expect(component.statusLabel()).toBe('Sin stock');
    });
  });

  describe('statusSeverity computed', () => {
    it('should return success for ok status', () => {
      fixture.componentRef.setInput('product', mockProduct);
      expect(component.statusSeverity()).toBe('success');
    });

    it('should return warn for low status', () => {
      fixture.componentRef.setInput('product', lowStockProduct);
      expect(component.statusSeverity()).toBe('warn');
    });

    it('should return danger for empty status', () => {
      fixture.componentRef.setInput('product', emptyStockProduct);
      expect(component.statusSeverity()).toBe('danger');
    });
  });

  describe('event emitters', () => {
    it('should emit edit event with product when onEdit is called', () => {
      const spy = jest.spyOn(component.edit, 'emit');
      component.onEdit();
      expect(spy).toHaveBeenCalledWith(mockProduct);
    });

    it('should emit delete event with product when onDelete is called', () => {
      const spy = jest.spyOn(component.delete, 'emit');
      component.onDelete();
      expect(spy).toHaveBeenCalledWith(mockProduct);
    });
  });
});
