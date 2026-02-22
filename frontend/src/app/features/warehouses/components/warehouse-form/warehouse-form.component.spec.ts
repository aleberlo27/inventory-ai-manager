import { TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { WarehouseFormComponent } from './warehouse-form.component';
import { WarehouseService } from '../../services/warehouse.service';
import type { Warehouse } from '@shared/types';

const mockWarehouse: Warehouse = {
  id: 'uuid-1',
  name: 'Main Warehouse',
  location: 'Madrid',
  description: 'Main storage facility',
  createdAt: '2024-01-01T00:00:00.000Z',
  productCount: 3,
};

describe('WarehouseFormComponent', () => {
  let component: WarehouseFormComponent;
  let mockWarehouseService: { createWarehouse: jest.Mock; updateWarehouse: jest.Mock };
  let mockMessageService: { add: jest.Mock };

  beforeEach(() => {
    mockWarehouseService = {
      createWarehouse: jest.fn().mockReturnValue(of(mockWarehouse)),
      updateWarehouse: jest.fn().mockReturnValue(of(mockWarehouse)),
    };
    mockMessageService = { add: jest.fn() };

    TestBed.configureTestingModule({
      imports: [WarehouseFormComponent],
      providers: [
        { provide: WarehouseService, useValue: mockWarehouseService },
        { provide: MessageService, useValue: mockMessageService },
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    const fixture = TestBed.createComponent(WarehouseFormComponent);
    component = fixture.componentInstance;
  });

  describe('Create mode (warehouse is null)', () => {
    it('should be in create mode when warehouse is null', () => {
      expect(component.isEditMode).toBe(false);
    });

    it('should have an empty form in create mode', () => {
      expect(component.form.value.name).toBe('');
      expect(component.form.value.location).toBe('');
      expect(component.form.value.description).toBe('');
    });

    it('should call createWarehouse when form is valid and submitted in create mode', () => {
      component.form.patchValue({ name: 'New WH', location: 'Barcelona' });
      component.onSubmit();
      expect(mockWarehouseService.createWarehouse).toHaveBeenCalledWith({
        name: 'New WH',
        location: 'Barcelona',
        description: '',
      });
    });

    it('should emit saved with the warehouse after createWarehouse succeeds', () => {
      const spy = jest.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'New WH', location: 'Barcelona' });
      component.onSubmit();
      expect(spy).toHaveBeenCalledWith(mockWarehouse);
    });

    it('should emit visibleChange(false) after createWarehouse succeeds', () => {
      const spy = jest.spyOn(component.visibleChange, 'emit');
      component.form.patchValue({ name: 'New WH', location: 'Barcelona' });
      component.onSubmit();
      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  describe('Edit mode (warehouse is provided)', () => {
    beforeEach(() => {
      component.warehouse = mockWarehouse;
      component.ngOnChanges();
    });

    it('should be in edit mode when warehouse is provided', () => {
      expect(component.isEditMode).toBe(true);
    });

    it('should pre-fill the form with the warehouse data in edit mode', () => {
      expect(component.form.value.name).toBe('Main Warehouse');
      expect(component.form.value.location).toBe('Madrid');
      expect(component.form.value.description).toBe('Main storage facility');
    });

    it('should call updateWarehouse with the correct id when submitted in edit mode', () => {
      component.form.patchValue({ name: 'Updated WH', location: 'Sevilla' });
      component.onSubmit();
      expect(mockWarehouseService.updateWarehouse).toHaveBeenCalledWith(
        'uuid-1',
        expect.objectContaining({ name: 'Updated WH', location: 'Sevilla' }),
      );
    });

    it('should emit saved with the warehouse after updateWarehouse succeeds', () => {
      const spy = jest.spyOn(component.saved, 'emit');
      component.onSubmit();
      expect(spy).toHaveBeenCalledWith(mockWarehouse);
    });
  });

  describe('Form validation', () => {
    it('should be invalid when name is empty', () => {
      component.form.patchValue({ name: '', location: 'Madrid' });
      expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when location is empty', () => {
      component.form.patchValue({ name: 'WH Name', location: '' });
      expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when name is shorter than 2 characters', () => {
      component.form.patchValue({ name: 'A', location: 'Madrid' });
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with name and location filled correctly', () => {
      component.form.patchValue({ name: 'My WH', location: 'Madrid' });
      expect(component.form.valid).toBe(true);
    });

    it('should NOT call createWarehouse if form is invalid', () => {
      component.onSubmit();
      expect(mockWarehouseService.createWarehouse).not.toHaveBeenCalled();
    });
  });

  describe('Error handling', () => {
    it('should call messageService.add on createWarehouse error', () => {
      mockWarehouseService.createWarehouse.mockReturnValue(
        throwError(() => new Error('Server error')),
      );
      component.form.patchValue({ name: 'New WH', location: 'Barcelona' });
      component.onSubmit();
      expect(mockMessageService.add).toHaveBeenCalled();
    });

    it('should set loading to false after error', () => {
      mockWarehouseService.createWarehouse.mockReturnValue(
        throwError(() => new Error('Server error')),
      );
      component.form.patchValue({ name: 'New WH', location: 'Barcelona' });
      component.onSubmit();
      expect(component.loading()).toBe(false);
    });
  });

  describe('onClose()', () => {
    it('should emit visibleChange(false) when onClose is called', () => {
      const spy = jest.spyOn(component.visibleChange, 'emit');
      component.onClose();
      expect(spy).toHaveBeenCalledWith(false);
    });

    it('should reset the form when onClose is called', () => {
      component.form.patchValue({ name: 'Some WH', location: 'Madrid' });
      component.onClose();
      expect(component.form.value.name).toBeNull();
    });
  });
});
