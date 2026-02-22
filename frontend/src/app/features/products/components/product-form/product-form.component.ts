import {
  AbstractControl,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  ValidationErrors,
  ValidatorFn,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
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
export class ProductFormComponent implements OnChanges {
  @Input() product: Product | null = null;
  @Input() warehouseId!: string;
  @Input() visible = false;
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() saved = new EventEmitter<Product>();

  private readonly productService = inject(ProductService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly unitOptions = UNIT_OPTIONS;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    sku: ['', [Validators.required, skuValidator]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    unit: ['', [Validators.required]],
    category: [''],
    minStock: [5, [Validators.min(0)]],
  });

  get isEditMode(): boolean {
    return this.product !== null;
  }

  toUppercase(value: string): string {
    return value.toUpperCase();
  }

  ngOnChanges(): void {
    if (this.product) {
      this.form.patchValue({
        name: this.product.name,
        sku: this.product.sku,
        quantity: this.product.quantity,
        unit: this.product.unit,
        category: this.product.category ?? '',
        minStock: this.product.minStock,
      });
    } else {
      this.form.reset({ quantity: 0, minStock: 5 });
    }
  }

  onSkuInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    this.form.get('sku')?.setValue(upper, { emitEvent: false });
    input.value = upper;
  }

  onClose(): void {
    this.visibleChange.emit(false);
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    const formValue = this.form.value as CreateProductDto;

    const request$ = this.isEditMode
      ? this.productService.updateProduct(this.product!.id, formValue)
      : this.productService.createProduct(this.warehouseId, formValue);

    request$.subscribe({
      next: product => {
        this.loading.set(false);
        this.saved.emit(product);
        this.visibleChange.emit(false);
        this.form.reset({ quantity: 0, minStock: 5 });
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'PRODUCT.SAVE_ERROR',
        });
      },
    });
  }
}
