import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { WarehouseService } from './warehouse.service';
import { APP_CONSTANTS } from '@shared/constants/app.constants';
import type { Warehouse, CreateWarehouseDto, UpdateWarehouseDto } from '@shared/types';

const mockWarehouse: Warehouse = {
  id: 'uuid-1',
  name: 'Main Warehouse',
  location: 'Madrid',
  description: 'Main storage facility',
  createdAt: '2024-01-01T00:00:00.000Z',
  productCount: 3,
};

describe('WarehouseService', () => {
  let service: WarehouseService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        WarehouseService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(WarehouseService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  describe('getWarehouses()', () => {
    it('should call GET /warehouses and return an array of warehouses', () => {
      let result: Warehouse[] | undefined;
      service.getWarehouses().subscribe(r => (result = r));

      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/warehouses`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: [mockWarehouse] });

      expect(result).toEqual([mockWarehouse]);
    });
  });

  describe('getWarehouseById()', () => {
    it('should call GET /warehouses/:id and return a single warehouse', () => {
      let result: Warehouse | undefined;
      service.getWarehouseById('uuid-1').subscribe(r => (result = r));

      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/warehouses/uuid-1`);
      expect(req.request.method).toBe('GET');
      req.flush({ data: mockWarehouse });

      expect(result).toEqual(mockWarehouse);
    });
  });

  describe('createWarehouse()', () => {
    it('should call POST /warehouses with the correct body and return the created warehouse', () => {
      const dto: CreateWarehouseDto = { name: 'New WH', location: 'Barcelona' };
      let result: Warehouse | undefined;
      service.createWarehouse(dto).subscribe(r => (result = r));

      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/warehouses`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(dto);
      req.flush({ data: mockWarehouse });

      expect(result).toEqual(mockWarehouse);
    });
  });

  describe('updateWarehouse()', () => {
    it('should call PATCH /warehouses/:id with the correct body and return the updated warehouse', () => {
      const dto: UpdateWarehouseDto = { name: 'Updated WH' };
      let result: Warehouse | undefined;
      service.updateWarehouse('uuid-1', dto).subscribe(r => (result = r));

      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/warehouses/uuid-1`);
      expect(req.request.method).toBe('PATCH');
      expect(req.request.body).toEqual(dto);
      req.flush({ data: mockWarehouse });

      expect(result).toEqual(mockWarehouse);
    });
  });

  describe('deleteWarehouse()', () => {
    it('should call DELETE /warehouses/:id', () => {
      let completed = false;
      service.deleteWarehouse('uuid-1').subscribe({ complete: () => (completed = true) });

      const req = httpMock.expectOne(`${APP_CONSTANTS.API_URL}/warehouses/uuid-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);

      expect(completed).toBe(true);
    });
  });
});
