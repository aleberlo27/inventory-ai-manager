import { Component, effect, inject, input, output, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Select } from 'primeng/select';

import { ProductService } from '../../services/product.service';
import type { CreateProductDto, Product } from '@shared/types';

export function skuValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value as string;
  if (!value) return null;
  return /^[A-Z0-9\-]+$/.test(value) ? null : { invalidSku: true };
}

export const UNIT_OPTIONS = [
  'unidades',
  'kg',
  'g',
  'litros',
  'ml',
  'cajas',
  'pallets',
  'metros',
  'm²',
];

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, Button, Dialog, InputText, InputNumber, Select],
  templateUrl: 'product-form.component.html',
})
export class ProductFormComponent {
  readonly product = input<Product | null>(null);
  readonly warehouseId = input.required<string>();
  readonly visible = input<boolean>(false);
  readonly visibleChange = output<boolean>();
  readonly saved = output<Product>();

  private readonly productService = inject(ProductService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly internalProduct = signal<Product | null>(null); // <-- signal interno para manejar formulario
  readonly unitOptions = UNIT_OPTIONS;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    sku: ['', [Validators.required, skuValidator]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    unit: ['', [Validators.required]],
    category: [''],
    minStock: [5, [Validators.min(0)]],
  });

  constructor() {
    // Actualiza internalProduct cuando cambia el input
    effect(() => {
      this.internalProduct.set(this.product());
    });

    // Mantiene el formulario sincronizado con internalProduct
    effect(() => {
      const product = this.internalProduct();
      if (product !== null) {
        this.form.patchValue({
          name: product.name,
          sku: product.sku,
          quantity: product.quantity,
          unit: product.unit,
          category: product.category ?? '',
          minStock: product.minStock,
        });
      } else {
        this.form.reset({ quantity: 0, minStock: 5 });
      }
    });
  }

  get isEditMode(): boolean {
    return this.internalProduct() !== null;
  }

  toUppercase(value: string): string {
    return value.toUpperCase();
  }

  onSkuInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    this.form.get('sku')?.setValue(upper, { emitEvent: false });
    input.value = upper;
  }

  onClose(): void {
    this.visibleChange.emit(false);
    this.form.reset({ quantity: 0, minStock: 5 });
    this.internalProduct.set(null); // <-- resetea el producto interno
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    const formValue = this.form.value as CreateProductDto;

    const request$ = this.isEditMode
      ? this.productService.updateProduct(this.internalProduct()!.id, formValue)
      : this.productService.createProduct(this.warehouseId(), formValue);

    request$.subscribe({
      next: product => {
        this.loading.set(false);
        this.saved.emit(product);
        this.visibleChange.emit(false);
        this.form.reset({ quantity: 0, minStock: 5 });
        this.internalProduct.set(null);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translate.instant('PRODUCT.SAVE_ERROR'),
        });
      },
    });
  }
}
