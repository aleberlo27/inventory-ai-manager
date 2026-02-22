import { Component, Input, computed, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { getStockStatus } from '@shared/utils/stock.utils';
import type { Product } from '@shared/types';

@Component({
  selector: 'app-stock-alert-banner',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: 'stock-alert-banner.component.html',
})
export class StockAlertBannerComponent {
  private readonly _products = signal<Product[]>([]);

  @Input() set products(value: Product[]) {
    this._products.set(value);
  }
  get products(): Product[] {
    return this._products();
  }

  lowStockProducts = computed(() =>
    this._products().filter(p => getStockStatus(p.quantity, p.minStock) === 'low'),
  );

  emptyProducts = computed(() =>
    this._products().filter(p => getStockStatus(p.quantity, p.minStock) === 'empty'),
  );

  hasAlerts = computed(
    () => this.lowStockProducts().length > 0 || this.emptyProducts().length > 0,
  );
}
