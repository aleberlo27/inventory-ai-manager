import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';

import { WarehouseCardComponent } from './warehouse-card.component';
import type { Warehouse } from '@shared/types';

const mockWarehouse: Warehouse = {
  id: 'uuid-1',
  name: 'Main Warehouse',
  location: 'Madrid',
  description: 'Main storage facility',
  createdAt: '2024-01-01T00:00:00.000Z',
  productCount: 5,
};

describe('WarehouseCardComponent', () => {
  let component: WarehouseCardComponent;
  let fixture: ComponentFixture<WarehouseCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [WarehouseCardComponent],
      providers: [provideZonelessChangeDetection(), provideTranslateService({ fallbackLang: 'es' })],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(WarehouseCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('warehouse', mockWarehouse);
  });

  it('should have the warehouse name accessible', () => {
    expect(component.warehouse().name).toBe('Main Warehouse');
  });

  it('should have the warehouse location accessible', () => {
    expect(component.warehouse().location).toBe('Madrid');
  });

  it('should show the correct product count', () => {
    expect(component.warehouse().productCount).toBe(5);
  });

  it('should show zero product count when productCount is undefined', () => {
    fixture.componentRef.setInput('warehouse', { ...mockWarehouse, productCount: undefined });
    expect(component.warehouse().productCount).toBeUndefined();
  });

  it('should emit edit event with the warehouse when onEdit is called', () => {
    const spy = jest.spyOn(component.edit, 'emit');
    component.onEdit();
    expect(spy).toHaveBeenCalledWith(mockWarehouse);
  });

  it('should emit delete event with the warehouse when onDelete is called', () => {
    const spy = jest.spyOn(component.delete, 'emit');
    component.onDelete();
    expect(spy).toHaveBeenCalledWith(mockWarehouse);
  });

  it('should emit view event with the warehouse id when onView is called', () => {
    const spy = jest.spyOn(component.view, 'emit');
    component.onView();
    expect(spy).toHaveBeenCalledWith('uuid-1');
  });
});
