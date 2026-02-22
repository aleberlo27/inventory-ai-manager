import type { StockStatus } from '../types/product.types';

export function getStockStatus(quantity: number, minStock: number): StockStatus {
  if (quantity <= 0) return 'empty';
  if (quantity <= minStock) return 'low';
  return 'ok';
}

export function getStockStatusLabel(status: StockStatus): string {
  const labels: Record<StockStatus, string> = {
    empty: 'Sin stock',
    low: 'Stock bajo',
    ok: 'En stock',
  };
  return labels[status];
}

export function getStockStatusSeverity(
  status: StockStatus,
): 'danger' | 'warn' | 'success' {
  const severities: Record<StockStatus, 'danger' | 'warn' | 'success'> = {
    empty: 'danger',
    low: 'warn',
    ok: 'success',
  };
  return severities[status];
}
