export function isLowStock(quantity: number, minStock: number): boolean {
  return quantity <= minStock;
}
