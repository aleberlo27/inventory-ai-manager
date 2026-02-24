import { Component, computed, input, output } from '@angular/core';
import { Tag } from 'primeng/tag';
import { Button } from 'primeng/button';

import {
  getStockStatus,
  getStockStatusLabel,
  getStockStatusSeverity,
} from '@shared/utils/stock.utils';
import type { Product, StockStatus } from '@shared/types';
import { TagSeverityType } from '@/app/core/models/types/tag-severity.type';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [Tag, Button],
  templateUrl: 'product-card.component.html',
})
export class ProductCardComponent {
  readonly product = input<Product>({} as Product);
  readonly edit = output<Product>();
  readonly delete = output<Product>();

  stockStatus = computed<StockStatus>(() =>
    getStockStatus(this.product().quantity, this.product().minStock),
  );

  statusLabel = computed(() => getStockStatusLabel(this.stockStatus()));

  statusSeverity = computed<TagSeverityType>(
    () => getStockStatusSeverity(this.stockStatus()) as TagSeverityType,
  );

  onEdit(): void {
    this.edit.emit(this.product());
  }

  onDelete(): void {
    this.delete.emit(this.product());
  }
}
