import {
  Component,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { Textarea } from 'primeng/textarea';

import { WarehouseService } from '../../services/warehouse.service';
import type { CreateWarehouseDto, Warehouse } from '@shared/types';

@Component({
  selector: 'app-warehouse-form',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, Button, Dialog, InputText, Textarea],
  templateUrl: 'warehouse-form.component.html',
})
export class WarehouseFormComponent {
  readonly warehouse = input<Warehouse | null>(null);
  readonly visible = input<boolean>(false);
  readonly visibleChange = output<boolean>();
  readonly saved = output<Warehouse>();

  private readonly warehouseService = inject(WarehouseService);
  private readonly messageService = inject(MessageService);
  private readonly fb = inject(FormBuilder);
  private readonly translate = inject(TranslateService);

  readonly loading = signal(false);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    location: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(200)]],
    description: ['', [Validators.maxLength(500)]],
  });

  constructor() {
    effect(() => {
      const warehouse = this.warehouse();
      if (warehouse) {
        this.form.patchValue({
          name: warehouse.name,
          location: warehouse.location,
          description: warehouse.description ?? '',
        });
      }
    });
  }

  get isEditMode(): boolean {
    return this.warehouse() !== null;
  }

  get nameControl(): AbstractControl {
    return this.form.get('name')!;
  }

  get locationControl(): AbstractControl {
    return this.form.get('location')!;
  }

  get descriptionControl(): AbstractControl {
    return this.form.get('description')!;
  }

  get descriptionLength(): number {
    return (this.descriptionControl.value as string)?.length ?? 0;
  }

  onClose(): void {
    this.visibleChange.emit(false);
    this.form.reset();
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    const formValue = this.form.value as CreateWarehouseDto;

    const request$ = this.isEditMode
      ? this.warehouseService.updateWarehouse(this.warehouse()!.id, formValue)
      : this.warehouseService.createWarehouse(formValue);

    request$.subscribe({
      next: warehouse => {
        this.loading.set(false);
        this.saved.emit(warehouse);
        this.visibleChange.emit(false);
        this.form.reset();
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translate.instant('WAREHOUSE.SAVE_ERROR'),
        });
      },
    });
  }
}
