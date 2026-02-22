import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { of, throwError } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { ProductFormComponent, skuValidator } from './product-form.component';
import { ProductService } from '../../services/product.service';
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

describe('skuValidator', () => {
  it('should return null for a valid SKU with uppercase letters, numbers and hyphens', () => {
    const control = { value: 'PROD-001' } as any;
    expect(skuValidator(control)).toBeNull();
  });

  it('should return null for a SKU with only uppercase letters', () => {
    const control = { value: 'ABC' } as any;
    expect(skuValidator(control)).toBeNull();
  });

  it('should return null for a SKU with only numbers', () => {
    const control = { value: 'ABC123' } as any;
    expect(skuValidator(control)).toBeNull();
  });

  it('should return { invalidSku: true } for a SKU with lowercase letters', () => {
    const control = { value: 'prod-001' } as any;
    expect(skuValidator(control)).toEqual({ invalidSku: true });
  });

  it('should return { invalidSku: true } for a SKU with spaces', () => {
    const control = { value: 'PROD 001' } as any;
    expect(skuValidator(control)).toEqual({ invalidSku: true });
  });

  it('should return { invalidSku: true } for a SKU with special characters', () => {
    const control = { value: 'PROD@01' } as any;
    expect(skuValidator(control)).toEqual({ invalidSku: true });
  });

  it('should return null for an empty value (required validator handles empty)', () => {
    const control = { value: '' } as any;
    expect(skuValidator(control)).toBeNull();
  });
});

describe('ProductFormComponent', () => {
  let component: ProductFormComponent;
  let fixture: ComponentFixture<ProductFormComponent>;
  let mockProductService: { createProduct: jest.Mock; updateProduct: jest.Mock };
  let mockMessageService: { add: jest.Mock };

  beforeEach(() => {
    mockProductService = {
      createProduct: jest.fn().mockReturnValue(of(mockProduct)),
      updateProduct: jest.fn().mockReturnValue(of(mockProduct)),
    };
    mockMessageService = { add: jest.fn() };

    TestBed.configureTestingModule({
      imports: [ProductFormComponent],
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: MessageService, useValue: mockMessageService },
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(ProductFormComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('warehouseId', 'wh-1');
  });

  describe('Create mode (product is null)', () => {
    it('should be in create mode when product is null', () => {
      expect(component.isEditMode).toBe(false);
    });

    it('should have an empty form in create mode', () => {
      expect(component.form.value.name).toBe('');
      expect(component.form.value.sku).toBe('');
      expect(component.form.value.quantity).toBe(0);
    });

    it('should call createProduct when form is valid and submitted in create mode', () => {
      component.form.patchValue({ name: 'New Product', sku: 'NEW-001', quantity: 5, unit: 'kg' });
      component.onSubmit();
      expect(mockProductService.createProduct).toHaveBeenCalledWith(
        'wh-1',
        expect.objectContaining({ name: 'New Product', sku: 'NEW-001', quantity: 5 }),
      );
    });

    it('should emit saved with the product after createProduct succeeds', () => {
      const spy = jest.spyOn(component.saved, 'emit');
      component.form.patchValue({ name: 'New Product', sku: 'NEW-001', quantity: 5, unit: 'kg' });
      component.onSubmit();
      expect(spy).toHaveBeenCalledWith(mockProduct);
    });

    it('should emit visibleChange(false) after createProduct succeeds', () => {
      const spy = jest.spyOn(component.visibleChange, 'emit');
      component.form.patchValue({ name: 'New Product', sku: 'NEW-001', quantity: 5, unit: 'kg' });
      component.onSubmit();
      expect(spy).toHaveBeenCalledWith(false);
    });
  });

  describe('Edit mode (product is provided)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('product', mockProduct);
      fixture.detectChanges();
    });

    it('should be in edit mode when product is provided', () => {
      expect(component.isEditMode).toBe(true);
    });

    it('should pre-fill the form with the product data in edit mode', () => {
      expect(component.form.value.name).toBe('Test Product');
      expect(component.form.value.sku).toBe('PROD-001');
      expect(component.form.value.quantity).toBe(10);
      expect(component.form.value.unit).toBe('unidades');
    });

    it('should call updateProduct with the correct id when submitted in edit mode', () => {
      component.form.patchValue({ name: 'Updated Product', sku: 'PROD-001', quantity: 20, unit: 'kg' });
      component.onSubmit();
      expect(mockProductService.updateProduct).toHaveBeenCalledWith(
        'prod-1',
        expect.objectContaining({ name: 'Updated Product', quantity: 20 }),
      );
    });

    it('should emit saved with the product after updateProduct succeeds', () => {
      const spy = jest.spyOn(component.saved, 'emit');
      component.onSubmit();
      expect(spy).toHaveBeenCalledWith(mockProduct);
    });
  });

  describe('Form validation', () => {
    it('should be invalid when name is empty', () => {
      component.form.patchValue({ name: '', sku: 'PROD-001', quantity: 5, unit: 'kg' });
      expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when SKU is empty', () => {
      component.form.patchValue({ name: 'Product', sku: '', quantity: 5, unit: 'kg' });
      expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when SKU has invalid characters', () => {
      component.form.patchValue({ name: 'Product', sku: 'prod 001', quantity: 5, unit: 'kg' });
      expect(component.form.get('sku')?.errors).toEqual({ invalidSku: true });
    });

    it('should be invalid when name is shorter than 2 characters', () => {
      component.form.patchValue({ name: 'A', sku: 'PROD-001', quantity: 5, unit: 'kg' });
      expect(component.form.invalid).toBe(true);
    });

    it('should be invalid when unit is empty', () => {
      component.form.patchValue({ name: 'Product', sku: 'PROD-001', quantity: 5, unit: '' });
      expect(component.form.invalid).toBe(true);
    });

    it('should be valid with all required fields correctly filled', () => {
      component.form.patchValue({ name: 'My Product', sku: 'MY-001', quantity: 10, unit: 'kg' });
      expect(component.form.valid).toBe(true);
    });

    it('should NOT call createProduct if form is invalid', () => {
      component.onSubmit();
      expect(mockProductService.createProduct).not.toHaveBeenCalled();
    });

    it('should be invalid when quantity is negative', () => {
      component.form.patchValue({ name: 'Product', sku: 'PROD-001', quantity: -1, unit: 'kg' });
      expect(component.form.get('quantity')?.errors).toBeTruthy();
    });
  });

  describe('SKU auto-uppercase', () => {
    it('should convert SKU to uppercase via the toUppercase helper', () => {
      const result = component.toUppercase('prod-001');
      expect(result).toBe('PROD-001');
    });
  });

  describe('Error handling', () => {
    it('should call messageService.add on createProduct error', () => {
      mockProductService.createProduct.mockReturnValue(throwError(() => new Error('Server error')));
      component.form.patchValue({ name: 'New Product', sku: 'NEW-001', quantity: 5, unit: 'kg' });
      component.onSubmit();
      expect(mockMessageService.add).toHaveBeenCalled();
    });

    it('should set loading to false after error', () => {
      mockProductService.createProduct.mockReturnValue(throwError(() => new Error('Server error')));
      component.form.patchValue({ name: 'New Product', sku: 'NEW-001', quantity: 5, unit: 'kg' });
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
      component.form.patchValue({ name: 'Some Product' });
      component.onClose();
      expect(component.form.value.name).toBeNull();
    });
  });
});
