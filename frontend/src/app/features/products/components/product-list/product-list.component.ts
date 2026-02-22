import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

import {
  getStockStatus,
  getStockStatusLabel,
  getStockStatusSeverity,
} from '@shared/utils/stock.utils';
import type { Product, StockStatus } from '@shared/types';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [TranslatePipe, Tag, Button, InputText, TableModule],
  templateUrl: 'product-list.component.html',
})
export class ProductListComponent {
  private readonly _products = signal<Product[]>([]);

  @Input() set products(value: Product[]) {
    this._products.set(value);
  }
  @Input() warehouseId!: string;
  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<Product>();
  @Output() add = new EventEmitter<void>();

  filterValue = signal('');

  filteredProducts = computed(() => {
    const query = this.filterValue().toLowerCase();
    if (!query) return this._products();
    return this._products().filter(
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

  getStockSeverity(product: Product): 'success' | 'warning' | 'danger' {
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
