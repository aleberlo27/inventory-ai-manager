import { Page, expect } from '@playwright/test';

/**
 * Page Object for the Warehouses list and detail pages.
 */
export class WarehousesPage {
  constructor(private page: Page) {}

  // — List selectors —
  get newWarehouseButton() {
    return this.page.locator('[data-testid="new-warehouse-btn"]');
  }
  get warehouseCards() {
    return this.page.locator('app-warehouse-card');
  }
  // Form dialog selectors
  get nameInput() {
    return this.page.locator('[data-testid="name-input"]');
  }
  get locationInput() {
    return this.page.locator('[data-testid="location-input"]');
  }
  get saveButton() {
    // p-button with data-testid="save-btn" wraps the actual <button>
    return this.page.locator('[data-testid="save-btn"] button');
  }
  get cancelButton() {
    return this.page.locator('[data-testid="cancel-btn"] button');
  }
  // Confirm dialog
  get confirmYesButton() {
    return this.page.getByRole('button', { name: 'Si', exact: true });
  }

  // — Actions —
  async goto() {
    await this.page.goto('/app/warehouses');
  }

  async openCreateDialog() {
    await this.newWarehouseButton.click();
  }

  async fillWarehouseForm(name: string, location: string) {
    await this.nameInput.fill(name);
    await this.locationInput.fill(location);
  }

  async saveForm() {
    await this.saveButton.click();
  }

  async createWarehouse(name: string, location: string) {
    await this.openCreateDialog();
    await this.fillWarehouseForm(name, location);
    await this.saveForm();
  }

  cardByName(name: string) {
    return this.page.locator('app-warehouse-card', { hasText: name });
  }

  async clickEdit(warehouseName: string) {
    const card = this.cardByName(warehouseName);
    await card.locator('[data-testid="edit-btn"] button').click();
  }

  async clickDelete(warehouseName: string) {
    const card = this.cardByName(warehouseName);
    await card.locator('[data-testid="delete-btn"] button').click();
  }

  async clickViewProducts(warehouseName: string) {
    const card = this.cardByName(warehouseName);
    await card.locator('[data-testid="view-btn"] button').click();
  }

  async confirmDelete() {
    await this.confirmYesButton.click();
  }

  // — Assertions —
  async expectWarehouseCount(count: number) {
    await expect(this.warehouseCards).toHaveCount(count);
  }

  async expectWarehouseVisible(name: string) {
    await expect(this.page.locator('app-warehouse-card', { hasText: name })).toBeVisible();
  }

  async expectWarehouseNotVisible(name: string) {
    await expect(this.page.locator('app-warehouse-card', { hasText: name })).not.toBeVisible();
  }
}
