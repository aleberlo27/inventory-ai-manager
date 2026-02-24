import { Component, computed, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import type { Product, ProductWithStock } from '@shared/types';
import { getStockStatus, getStockStatusLabel } from '@shared/utils/stock.utils';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [TranslatePipe, ButtonModule, InputText, TableModule, CommonModule],
  templateUrl: 'product-list.component.html',
})
export class ProductListComponent {
  readonly products = input<Product[]>([]);
  readonly warehouseId = input.required<string>();
  readonly edit = output<Product>();
  readonly delete = output<Product>();
  readonly add = output<void>();

  filterValue = signal('');

  /** Precalcular estado de stock en cada producto */
  filteredProducts = computed<ProductWithStock[]>(() => {
    const query = this.filterValue().toLowerCase();

    return this.products()
      .filter(p =>
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.sku.toLowerCase().includes(query)
      )
      .map(p => ({
        ...p,
        stockStatus: getStockStatus(p.quantity, p.minStock)
      }));
  });

  /** Etiqueta del stock */
  getStockLabel(product: ProductWithStock): string {
    return getStockStatusLabel(product.stockStatus);
  }

  /** Row class si quieres colorear la fila */
  getRowClass(product: ProductWithStock): string {
    const status = product.stockStatus;
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
