import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Skeleton } from 'primeng/skeleton';
import { Toast } from 'primeng/toast';
import { ConfirmDialog } from 'primeng/confirmdialog';

import { WarehouseService } from '../../services/warehouse.service';
import { WarehouseCardComponent } from '../warehouse-card/warehouse-card.component';
import { WarehouseFormComponent } from '../warehouse-form/warehouse-form.component';
import type { Warehouse } from '@shared/types';

@Component({
  selector: 'app-warehouse-list',
  standalone: true,
  imports: [
    TranslatePipe,
    Button,
    Skeleton,
    Toast,
    ConfirmDialog,
    WarehouseCardComponent,
    WarehouseFormComponent,
  ],
  templateUrl: 'warehouse-list.component.html',
})
export class WarehouseListComponent implements OnInit {
  private readonly warehouseService = inject(WarehouseService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly warehouses = signal<Warehouse[]>([]);
  readonly loading = signal(true);
  readonly showForm = signal(false);
  readonly selectedWarehouse = signal<Warehouse | null>(null);

  ngOnInit(): void {
    this.loadWarehouses();
  }

  loadWarehouses(): void {
    this.loading.set(true);
    this.warehouseService.getWarehouses().subscribe({
      next: warehouses => {
        this.warehouses.set(warehouses);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translate.instant('WAREHOUSE.LOAD_ERROR'),
        });
      },
    });
  }

  openCreateDialog(): void {
    this.selectedWarehouse.set(null);
    this.showForm.set(true);
  }

  openEditDialog(warehouse: Warehouse): void {
    this.selectedWarehouse.set(warehouse);
    this.showForm.set(true);
  }

  confirmDelete(warehouse: Warehouse): void {
    const message = this.translate.instant('WAREHOUSE.DELETE_MESSAGE', {
      name: warehouse.name,
    });
    const header = this.translate.instant('WAREHOUSE.DELETE_HEADER');
    const yes = this.translate.instant('GENERAL.YES');
    const no = this.translate.instant('GENERAL.NO');

    this.confirmationService.confirm({
      message,
      header,
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteWarehouse(warehouse.id),
      reject: () => { },
      acceptLabel: yes,
      rejectLabel: no,
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
    });
  }

  deleteWarehouse(id: string): void {
    this.warehouseService.deleteWarehouse(id).subscribe({
      next: () => {
        this.warehouses.update(list => list.filter(w => w.id !== id));
        this.messageService.add({
          severity: 'success',
          summary: 'OK',
          detail: this.translate.instant('WAREHOUSE.DELETE_SUCCESS'),
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: this.translate.instant('WAREHOUSE.DELETE_ERROR'),
        });
      },
    });
  }

  navigateToWarehouse(id: string): void {
    this.router.navigate(['/app/warehouses', id]);
  }

  onFormSaved(_warehouse: Warehouse): void {
    this.loadWarehouses();
    this.showForm.set(false);
  }
}
