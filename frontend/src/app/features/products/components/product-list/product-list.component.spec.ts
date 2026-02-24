import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';

import { ProductListComponent } from './product-list.component';
import type { Product, ProductWithStock } from '@shared/types';

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
  let fixture: ComponentFixture<ProductListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ProductListComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(ProductListComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('products', mockProducts);
    fixture.componentRef.setInput('warehouseId', 'wh-1');
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
    it('filteredProducts should compute ok stockStatus for sufficient quantity', () => {
      expect(component.filteredProducts()[0].stockStatus).toBe('ok');
    });

    it('filteredProducts should compute low stockStatus for quantity at or below minStock', () => {
      expect(component.filteredProducts()[1].stockStatus).toBe('low');
    });

    it('filteredProducts should compute empty stockStatus for zero quantity', () => {
      expect(component.filteredProducts()[2].stockStatus).toBe('empty');
    });

    it('should return correct label for ok status', () => {
      const product: ProductWithStock = { ...mockProducts[0], stockStatus: 'ok' };
      expect(component.getStockLabel(product)).toBe('En stock');
    });

    it('should return correct label for low status', () => {
      const product: ProductWithStock = { ...mockProducts[1], stockStatus: 'low' };
      expect(component.getStockLabel(product)).toBe('Stock bajo');
    });

    it('should return correct label for empty status', () => {
      const product: ProductWithStock = { ...mockProducts[2], stockStatus: 'empty' };
      expect(component.getStockLabel(product)).toBe('Sin stock');
    });
  });

  describe('row CSS class', () => {
    it('should return empty string for ok-stock product', () => {
      const product: ProductWithStock = { ...mockProducts[0], stockStatus: 'ok' };
      expect(component.getRowClass(product)).toBe('');
    });

    it('should return warning class for low-stock product', () => {
      const product: ProductWithStock = { ...mockProducts[1], stockStatus: 'low' };
      expect(component.getRowClass(product)).toContain('bg-yellow');
    });

    it('should return danger class for empty-stock product', () => {
      const product: ProductWithStock = { ...mockProducts[2], stockStatus: 'empty' };
      expect(component.getRowClass(product)).toContain('bg-red');
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
