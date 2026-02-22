import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';

import { WarehouseListComponent } from './warehouse-list.component';
import { WarehouseService } from '../../services/warehouse.service';
import type { Warehouse } from '@shared/types';

const mockWarehouses: Warehouse[] = [
  {
    id: 'uuid-1',
    name: 'Main Warehouse',
    location: 'Madrid',
    description: 'Main storage',
    createdAt: '2024-01-01T00:00:00.000Z',
    productCount: 3,
  },
  {
    id: 'uuid-2',
    name: 'Secondary Warehouse',
    location: 'Barcelona',
    createdAt: '2024-01-02T00:00:00.000Z',
    productCount: 0,
  },
];

describe('WarehouseListComponent', () => {
  let component: WarehouseListComponent;
  let mockWarehouseService: { getWarehouses: jest.Mock; deleteWarehouse: jest.Mock };
  let confirmationService: ConfirmationService;
  let router: Router;

  beforeEach(() => {
    mockWarehouseService = {
      getWarehouses: jest.fn().mockReturnValue(of(mockWarehouses)),
      deleteWarehouse: jest.fn().mockReturnValue(of(undefined)),
    };

    TestBed.configureTestingModule({
      imports: [WarehouseListComponent],
      providers: [
        { provide: WarehouseService, useValue: mockWarehouseService },
        ConfirmationService,
        MessageService,
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(WarehouseListComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    confirmationService = TestBed.inject(ConfirmationService);

    jest.spyOn(router, 'navigate').mockResolvedValue(true);
    jest.spyOn(confirmationService, 'confirm').mockImplementation(() => confirmationService);
  });

  it('should start with loading state true before init', () => {
    expect(component.loading()).toBe(true);
  });

  it('should load warehouses on init and set loading to false', () => {
    component.loadWarehouses();
    expect(component.warehouses()).toEqual(mockWarehouses);
    expect(component.loading()).toBe(false);
  });

  it('should set loading to true then false during warehouse load', () => {
    const subject = new Subject<Warehouse[]>();
    mockWarehouseService.getWarehouses.mockReturnValue(subject);

    component.loadWarehouses();
    expect(component.loading()).toBe(true);

    subject.next(mockWarehouses);
    subject.complete();
    expect(component.loading()).toBe(false);
    expect(component.warehouses()).toEqual(mockWarehouses);
  });

  it('should show empty list when no warehouses exist', () => {
    mockWarehouseService.getWarehouses.mockReturnValue(of([]));
    component.loadWarehouses();
    expect(component.warehouses()).toEqual([]);
    expect(component.loading()).toBe(false);
  });

  it('should set showForm to true and selectedWarehouse to null when openCreateDialog is called', () => {
    component.openCreateDialog();
    expect(component.showForm()).toBe(true);
    expect(component.selectedWarehouse()).toBeNull();
  });

  it('should set showForm to true and selectedWarehouse to the warehouse when openEditDialog is called', () => {
    component.openEditDialog(mockWarehouses[0]);
    expect(component.showForm()).toBe(true);
    expect(component.selectedWarehouse()).toEqual(mockWarehouses[0]);
  });

  it('should call confirmationService.confirm when confirmDelete is called', () => {
    component.confirmDelete(mockWarehouses[0]);
    expect(confirmationService.confirm).toHaveBeenCalled();
  });

  it('should navigate to warehouse detail when navigateToWarehouse is called', () => {
    component.navigateToWarehouse('uuid-1');
    expect(router.navigate).toHaveBeenCalledWith(['/app/warehouses', 'uuid-1']);
  });

  it('should remove warehouse from list after deleteWarehouse', () => {
    component.loadWarehouses();
    component.deleteWarehouse('uuid-1');
    expect(component.warehouses().find(w => w.id === 'uuid-1')).toBeUndefined();
  });

  it('should reload warehouses and close form after onFormSaved', () => {
    component.showForm.set(true);
    component.onFormSaved(mockWarehouses[0]);
    expect(mockWarehouseService.getWarehouses).toHaveBeenCalled();
    expect(component.showForm()).toBe(false);
  });
});
