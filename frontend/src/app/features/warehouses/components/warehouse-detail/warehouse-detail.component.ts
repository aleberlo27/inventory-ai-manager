import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Button } from 'primeng/button';
import { Tag } from 'primeng/tag';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';

import { WarehouseService } from '../../services/warehouse.service';
import { ProductService } from '../../../products/services/product.service';
import { ProductListComponent } from '../../../products/components/product-list/product-list.component';
import { ProductFormComponent } from '../../../products/components/product-form/product-form.component';
import { getStockStatus } from '@shared/utils/stock.utils';
import type { Product, Warehouse } from '@shared/types';

@Component({
  selector: 'app-warehouse-detail',
  standalone: true,
  imports: [TranslatePipe, Button, Tag, ConfirmDialog, Toast, ProductListComponent, ProductFormComponent],
  templateUrl: 'warehouse-detail.component.html',
})
export class WarehouseDetailComponent implements OnInit {
  warehouseId = signal('');
  warehouse = signal<Warehouse | null>(null);
  products = signal<Product[]>([]);
  loading = signal(true);
  showProductForm = signal(false);
  selectedProduct = signal<Product | null>(null);

  lowStockCount = computed(
    () => this.products().filter(p => getStockStatus(p.quantity, p.minStock) !== 'ok').length,
  );

  totalUnits = computed(() => this.products().reduce((sum, p) => sum + p.quantity, 0));

  private readonly warehouseService = inject(WarehouseService);
  private readonly productService = inject(ProductService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.warehouseId.set(id);
    this.loadWarehouse(id);
  }

  loadWarehouse(id: string): void {
    this.loading.set(true);
    this.warehouseService.getWarehouseById(id).subscribe({
      next: warehouse => {
        this.warehouse.set(warehouse);
        this.loadProducts(id);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'WAREHOUSE.LOAD_ERROR',
        });
      },
    });
  }

  loadProducts(warehouseId: string): void {
    this.productService.getProductsByWarehouse(warehouseId).subscribe({
      next: products => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'PRODUCT.LOAD_ERROR',
        });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/app/warehouses']);
  }

  openAddProduct(): void {
    this.selectedProduct.set(null);
    this.showProductForm.set(true);
  }

  openEditProduct(product: Product): void {
    this.selectedProduct.set(product);
    this.showProductForm.set(true);
  }

  onProductSaved(): void {
    this.loadProducts(this.warehouseId());
    this.showProductForm.set(false);
  }

  confirmDeleteProduct(product: Product): void {
    this.confirmationService.confirm({
      message: `¿Seguro que quieres eliminar "${product.name}"?`,
      header: 'Confirmar eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => this.deleteProduct(product.id),
    });
  }

  deleteProduct(id: string): void {
    this.productService.deleteProduct(id).subscribe({
      next: () => {
        this.products.update(list => list.filter(p => p.id !== id));
        this.messageService.add({
          severity: 'success',
          summary: 'OK',
          detail: 'PRODUCT.DELETE_SUCCESS',
        });
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'PRODUCT.DELETE_ERROR',
        });
      },
    });
  }
}
