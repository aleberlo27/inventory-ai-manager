import { isLowStock } from '@/shared/utils/inventory.utils';

describe('isLowStock', () => {
  it('should return true when quantity is less than or equal to minStock', () => {
    expect(isLowStock(5, 5)).toBe(true);
    expect(isLowStock(3, 5)).toBe(true);
  });

  it('should return false when quantity is greater than minStock', () => {
    expect(isLowStock(6, 5)).toBe(false);
    expect(isLowStock(10, 5)).toBe(false);
  });
});
