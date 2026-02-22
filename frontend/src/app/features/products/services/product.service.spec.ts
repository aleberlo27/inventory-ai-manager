import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ProductService } from './product.service';
import { APP_CONSTANTS } from '@shared/constants/app.constants';
import type { Product, CreateProductDto, UpdateProductDto } from '@shared/types';

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

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getProductsByWarehouse()', () => {
    it('should call GET /warehouses/:warehouseId/products and return products', () => {
      let result: Product[] | undefined;
      service.getProductsByWarehouse('wh-1').subscribe(r => (result = r));

      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/warehouses/wh-1/products`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [mockProduct] });

      expect(result).toEqual([mockProduct]);
    });
  });

  describe('getProductById()', () => {
    it('should call GET /products/:id and return a single product', () => {
      let result: Product | undefined;
      service.getProductById('prod-1').subscribe(r => (result = r));

      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/products/prod-1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockProduct });

      expect(result).toEqual(mockProduct);
    });
  });

  describe('createProduct()', () => {
    it('should call POST /warehouses/:warehouseId/products with the correct body and return product', () => {
      const dto: CreateProductDto = { name: 'New Product', sku: 'NEW-001', quantity: 5, unit: 'kg' };
      let result: Product | undefined;
      service.createProduct('wh-1', dto).subscribe(r => (result = r));

      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/warehouses/wh-1/products`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ data: mockProduct });

      expect(result).toEqual(mockProduct);
    });
  });

  describe('updateProduct()', () => {
    it('should call PATCH /products/:id with the correct body and return updated product', () => {
      const dto: UpdateProductDto = { name: 'Updated Product' };
      let result: Product | undefined;
      service.updateProduct('prod-1', dto).subscribe(r => (result = r));

      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/products/prod-1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush({ data: mockProduct });

      expect(result).toEqual(mockProduct);
    });
  });

  describe('deleteProduct()', () => {
    it('should call DELETE /products/:id', () => {
      let completed = false;
      service.deleteProduct('prod-1').subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/products/prod-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(completed).toBe(true);
    });
  });

  describe('searchProducts()', () => {
    it('should call GET /products/search?q=query and return products', () => {
      let result: Product[] | undefined;
      service.searchProducts('laptop').subscribe(r => (result = r));

      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/products/search?q=laptop`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [mockProduct] });

      expect(result).toEqual([mockProduct]);
    });
  });
});
