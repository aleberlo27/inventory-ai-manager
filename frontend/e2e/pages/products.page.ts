import { Page, expect } from '@playwright/test';

/**
 * Page Object for the Products section within a Warehouse Detail page.
 * The product list uses p-table via app-product-list component.
 */
export class ProductsPage {
  constructor(private page: Page) {}

  // — Selectors —
  get addProductButton() {
    return this.page.getByRole('button', { name: 'Añadir Producto' });
  }
  get productRows() {
    return this.page.locator('p-table tbody tr');
  }
  get searchInput() {
    return this.page.getByPlaceholder('Buscar por nombre o SKU...');
  }

  // Product form dialog selectors
  get nameInput() {
    return this.page.locator('p-dialog input[placeholder]').first();
  }
  get skuInput() {
    return this.page.locator('p-dialog input').nth(1);
  }
  get quantityInput() {
    return this.page.locator('p-inputNumber').first().locator('input');
  }
  get saveProductButton() {
    return this.page.getByRole('button', { name: 'Crear Producto' });
  }
  get updateProductButton() {
    return this.page.getByRole('button', { name: 'Guardar Cambios' });
  }
  get confirmYesButton() {
    return this.page.getByRole('button', { name: 'Yes' });
  }

  // — Actions —
  async createProduct(name: string, sku: string, quantity: number) {
    await this.addProductButton.click();
    // Fill name
    await this.page.locator('p-dialog').getByPlaceholder('Nombre').fill(name);
    // Fill SKU
    await this.page.locator('p-dialog').getByPlaceholder('SKU').fill(sku);
    // Fill quantity via number input
    const qtyInput = this.page.locator('p-inputNumber').first().locator('input');
    await qtyInput.click({ clickCount: 3 });
    await qtyInput.fill(quantity.toString());
    // Select unit (first option from dropdown)
    await this.page.locator('p-select').click();
    await this.page.locator('.p-select-option').first().click();
    await this.saveProductButton.click();
  }

  async filterByName(query: string) {
    await this.searchInput.fill(query);
  }

  async clickEditRow(productName: string) {
    const row = this.page.locator('p-table tbody tr', { hasText: productName });
    await row.locator('button').first().click();
  }

  async clickDeleteRow(productName: string) {
    const row = this.page.locator('p-table tbody tr', { hasText: productName });
    await row.locator('button').nth(1).click();
  }

  async confirmDelete() {
    await this.confirmYesButton.click();
  }

  // — Assertions —
  async expectProductCount(count: number) {
    await expect(this.productRows).toHaveCount(count);
  }

  async expectProductVisible(name: string) {
    await expect(this.page.locator('p-table').getByText(name)).toBeVisible();
  }

  async expectProductNotVisible(name: string) {
    await expect(this.page.locator('p-table').getByText(name)).not.toBeVisible();
  }

  async expectStockStatus(productName: string, status: string) {
    const row = this.page.locator('p-table tbody tr', { hasText: productName });
    await expect(row.getByText(status)).toBeVisible();
  }
}
