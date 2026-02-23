import { Component, computed, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Tag, TagModule } from 'primeng/tag';
import { Button, ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

import {
  getStockStatus,
  getStockStatusLabel,
  getStockStatusSeverity,
} from '@shared/utils/stock.utils';
import type { Product, StockStatus } from '@shared/types';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [TranslatePipe, TagModule, ButtonModule, InputText, TableModule, CommonModule],
  templateUrl: 'product-list.component.html',
})
export class ProductListComponent {
  readonly products = input<Product[]>([]);
  readonly warehouseId = input.required<string>();
  readonly edit = output<Product>();
  readonly delete = output<Product>();
  readonly add = output<void>();

  filterValue = signal('');

  filteredProducts = computed(() => {
    const query = this.filterValue().toLowerCase();
    if (!query) return this.products();
    return this.products().filter(
      p =>
        p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query),
    );
  });

  getStockStatus(product: Product): StockStatus {
    return getStockStatus(product.quantity, product.minStock);
  }

  getStockLabel(product: Product): string {
    return getStockStatusLabel(this.getStockStatus(product));
  }

  getStockSeverity(product: Product): 'success' | 'warn' | 'danger' {
    return getStockStatusSeverity(this.getStockStatus(product));
  }

  getRowClass(product: Product): string {
    const status = this.getStockStatus(product);
    if (status === 'empty') return 'bg-red-50';
    if (status === 'low') return 'bg-yellow-50';
    return '';
  }

  onEdit(product: Product): void {
    this.edit.emit(product);
  }

  onDelete(product: Product): void {
    this.delete.emit(product);
  }

  onAdd(): void {
    this.add.emit();
  }
}
