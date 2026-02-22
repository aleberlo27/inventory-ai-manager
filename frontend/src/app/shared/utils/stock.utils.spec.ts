import {
  getStockStatus,
  getStockStatusLabel,
  getStockStatusSeverity,
} from '@shared/utils/stock.utils';

describe('getStockStatus', () => {
  it('should return "empty" when quantity is 0', () => {
    expect(getStockStatus(0, 5)).toBe('empty');
  });

  it('should return "empty" when quantity is negative', () => {
    expect(getStockStatus(-3, 5)).toBe('empty');
  });

  it('should return "low" when quantity equals minStock', () => {
    expect(getStockStatus(5, 5)).toBe('low');
  });

  it('should return "low" when quantity is less than minStock', () => {
    expect(getStockStatus(3, 5)).toBe('low');
  });

  it('should return "ok" when quantity is greater than minStock', () => {
    expect(getStockStatus(6, 5)).toBe('ok');
  });
});

describe('getStockStatusLabel', () => {
  it('should return "Sin stock" for empty', () => {
    expect(getStockStatusLabel('empty')).toBe('Sin stock');
  });

  it('should return "Stock bajo" for low', () => {
    expect(getStockStatusLabel('low')).toBe('Stock bajo');
  });

  it('should return "En stock" for ok', () => {
    expect(getStockStatusLabel('ok')).toBe('En stock');
  });
});

describe('getStockStatusSeverity', () => {
  it('should return "danger" for empty', () => {
    expect(getStockStatusSeverity('empty')).toBe('danger');
  });

  it('should return "warning" for low', () => {
    expect(getStockStatusSeverity('low')).toBe('warning');
  });

  it('should return "success" for ok', () => {
    expect(getStockStatusSeverity('ok')).toBe('success');
  });
});
