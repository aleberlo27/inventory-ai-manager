import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';

import {
  getStockStatus,
  getStockStatusLabel,
  getStockStatusSeverity,
} from '@shared/utils/stock.utils';
import type { Product, StockStatus } from '@shared/types';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [TranslatePipe, Tag, Button],
  templateUrl: 'product-card.component.html',
})
export class ProductCardComponent {
  private readonly _product = signal<Product>({} as Product);

  @Input() set product(value: Product) {
    this._product.set(value);
  }
  get product(): Product {
    return this._product();
  }

  @Output() edit = new EventEmitter<Product>();
  @Output() delete = new EventEmitter<Product>();

  stockStatus = computed<StockStatus>(() =>
    getStockStatus(this._product().quantity, this._product().minStock),
  );

  statusLabel = computed(() => getStockStatusLabel(this.stockStatus()));

  statusSeverity = computed(() => getStockStatusSeverity(this.stockStatus()));

  onEdit(): void {
    this.edit.emit(this._product());
  }

  onDelete(): void {
    this.delete.emit(this._product());
  }
}
