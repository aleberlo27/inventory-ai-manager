import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';

import { WarehouseDetailComponent } from './warehouse-detail.component';
import { WarehouseService } from '../../services/warehouse.service';
import { ProductService } from '../../../products/services/product.service';
import type { Product, Warehouse } from '@shared/types';

const mockWarehouse: Warehouse = {
  id: 'wh-1',
  name: 'Main Warehouse',
  location: 'Madrid',
  description: 'Main storage facility',
  createdAt: '2024-01-01T00:00:00.000Z',
};

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
    sku: 'PROD-B',
    quantity: 2,
    unit: 'kg',
    minStock: 5,
    warehouseId: 'wh-1',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: 'prod-3',
    name: 'Product Gamma',
    sku: 'PROD-C',
    quantity: 0,
    unit: 'litros',
    minStock: 5,
    warehouseId: 'wh-1',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
];

describe('WarehouseDetailComponent', () => {
  let component: WarehouseDetailComponent;
  let mockWarehouseService: { getWarehouseById: jest.Mock };
  let mockProductService: { getProductsByWarehouse: jest.Mock; deleteProduct: jest.Mock };
  let mockRouter: { navigate: jest.Mock };

  beforeEach(() => {
    mockWarehouseService = {
      getWarehouseById: jest.fn().mockReturnValue(of(mockWarehouse)),
    };
    mockProductService = {
      getProductsByWarehouse: jest.fn().mockReturnValue(of(mockProducts)),
      deleteProduct: jest.fn().mockReturnValue(of(undefined)),
    };
    mockRouter = { navigate: jest.fn().mockResolvedValue(true) };

    TestBed.configureTestingModule({
      imports: [WarehouseDetailComponent],
      providers: [
        { provide: WarehouseService, useValue: mockWarehouseService },
        { provide: ProductService, useValue: mockProductService },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => 'wh-1' } } },
        },
        { provide: Router, useValue: mockRouter },
        ConfirmationService,
        MessageService,
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(WarehouseDetailComponent);
    component = fixture.componentInstance;
  });

  it('should start with loading true', () => {
    expect(component.loading()).toBe(true);
  });

  it('should load warehouse and products on init', () => {
    component.ngOnInit();
    expect(mockWarehouseService.getWarehouseById).toHaveBeenCalledWith('wh-1');
    expect(mockProductService.getProductsByWarehouse).toHaveBeenCalledWith('wh-1');
    expect(component.warehouse()).toEqual(mockWarehouse);
    expect(component.products()).toEqual(mockProducts);
    expect(component.loading()).toBe(false);
  });

  it('should show the warehouse name after loading', () => {
    component.ngOnInit();
    expect(component.warehouse()?.name).toBe('Main Warehouse');
  });

  it('should compute lowStockCount correctly (low + empty)', () => {
    component.ngOnInit();
    // prod-2: quantity 2 <= minStock 5 → low; prod-3: quantity 0 → empty
    expect(component.lowStockCount()).toBe(2);
  });

  it('should compute lowStockCount as 0 when all products have enough stock', () => {
    mockProductService.getProductsByWarehouse.mockReturnValue(
      of([{ ...mockProducts[0], quantity: 10, minStock: 5 }]),
    );
    component.ngOnInit();
    expect(component.lowStockCount()).toBe(0);
  });

  it('should set loading to false after loading completes', () => {
    component.ngOnInit();
    expect(component.loading()).toBe(false);
  });

  it('should navigate to /app/warehouses when goBack is called', () => {
    component.goBack();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/warehouses']);
  });

  it('should set showProductForm to true and selectedProduct to null on openAddProduct', () => {
    component.openAddProduct();
    expect(component.showProductForm()).toBe(true);
    expect(component.selectedProduct()).toBeNull();
  });

  it('should set showProductForm to true and selectedProduct on openEditProduct', () => {
    component.openEditProduct(mockProducts[0]);
    expect(component.showProductForm()).toBe(true);
    expect(component.selectedProduct()).toEqual(mockProducts[0]);
  });

  it('should reload products and close form after onProductSaved', () => {
    component.warehouseId.set('wh-1');
    component.showProductForm.set(true);
    component.onProductSaved();
    expect(mockProductService.getProductsByWarehouse).toHaveBeenCalledWith('wh-1');
    expect(component.showProductForm()).toBe(false);
  });
});
