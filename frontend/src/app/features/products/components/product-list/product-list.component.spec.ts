import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';

import { ProductListComponent } from './product-list.component';
import type { Product } from '@shared/types';

const mockProducts: Product[] = [
  {
    id: 'prod-1',
    name: 'Product Alpha',
    sku: 'PROD-A',
    quantity: 10,
    unit: 'unidades',
    minStock: 5,
    warehouseId: 'wh-1',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-2',
    name: 'Product Beta',
    sku: 'BETA-001',
    quantity: 3,
    unit: 'kg',
    minStock: 5,
    warehouseId: 'wh-1',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'Product Gamma',
    sku: 'GAMA-001',
    quantity: 0,
    unit: 'litros',
    minStock: 5,
    warehouseId: 'wh-1',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('ProductListComponent', () => {
  let component: ProductListComponent;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    component.products = mockProducts;
    component.warehouseId = 'wh-1';
  });

  describe('filteredProducts', () => {
    it('should return all products when no filter is applied', () => {
      expect(component.filteredProducts()).toHaveLength(3);
    });

    it('should filter products by name (case-insensitive)', () => {
      component.filterValue.set('alpha');
      expect(component.filteredProducts()).toHaveLength(1);
      expect(component.filteredProducts()[0].name).toBe('Product Alpha');
    });

    it('should filter products by SKU (case-insensitive)', () => {
      component.filterValue.set('beta');
      expect(component.filteredProducts()).toHaveLength(1);
      expect(component.filteredProducts()[0].sku).toBe('BETA-001');
    });

    it('should return empty array when filter matches nothing', () => {
      component.filterValue.set('nonexistent');
      expect(component.filteredProducts()).toHaveLength(0);
    });

    it('should return all products when filter is cleared', () => {
      component.filterValue.set('alpha');
      component.filterValue.set('');
      expect(component.filteredProducts()).toHaveLength(3);
    });
  });

  describe('stock status helpers', () => {
    it('should return ok status for product with sufficient quantity', () => {
      expect(component.getStockStatus(mockProducts[0])).toBe('ok');
    });

    it('should return low status for product with quantity at or below minStock', () => {
      expect(component.getStockStatus(mockProducts[1])).toBe('low');
    });

    it('should return empty status for product with zero quantity', () => {
      expect(component.getStockStatus(mockProducts[2])).toBe('empty');
    });

    it('should return correct severity for ok status', () => {
      expect(component.getStockSeverity(mockProducts[0])).toBe('success');
    });

    it('should return correct severity for low status', () => {
      expect(component.getStockSeverity(mockProducts[1])).toBe('warning');
    });

    it('should return correct severity for empty status', () => {
      expect(component.getStockSeverity(mockProducts[2])).toBe('danger');
    });

    it('should return correct label for ok status', () => {
      expect(component.getStockLabel(mockProducts[0])).toBe('En stock');
    });

    it('should return correct label for low status', () => {
      expect(component.getStockLabel(mockProducts[1])).toBe('Stock bajo');
    });

    it('should return correct label for empty status', () => {
      expect(component.getStockLabel(mockProducts[2])).toBe('Sin stock');
    });
  });

  describe('row CSS class', () => {
    it('should return empty string for ok-stock product', () => {
      expect(component.getRowClass(mockProducts[0])).toBe('');
    });

    it('should return warning class for low-stock product', () => {
      expect(component.getRowClass(mockProducts[1])).toContain('bg-yellow');
    });

    it('should return danger class for empty-stock product', () => {
      expect(component.getRowClass(mockProducts[2])).toContain('bg-red');
    });
  });

  describe('event emitters', () => {
    it('should emit edit event with product when onEdit is called', () => {
      const spy = jest.spyOn(component.edit, 'emit');
      component.onEdit(mockProducts[0]);
      expect(spy).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('should emit delete event with product when onDelete is called', () => {
      const spy = jest.spyOn(component.delete, 'emit');
      component.onDelete(mockProducts[0]);
      expect(spy).toHaveBeenCalledWith(mockProducts[0]);
    });

    it('should emit add event when onAdd is called', () => {
      const spy = jest.spyOn(component.add, 'emit');
      component.onAdd();
      expect(spy).toHaveBeenCalled();
    });
  });
});
