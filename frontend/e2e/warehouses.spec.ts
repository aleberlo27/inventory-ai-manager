import { test, expect } from '@playwright/test';
import { WarehousesPage } from './pages/warehouses.page';
import { ApiHelper, uniqueEmail } from './helpers/api.helper';

/**
 * Warehouse CRUD flow tests — TC-06 to TC-09
 */

const TEST_USER = {
  name: 'Warehouse Tester',
  email: uniqueEmail('wh'),
  password: 'password123',
};

/** Logs in via localStorage injection (faster than UI login for setup). */
async function loginViaApi(page: import('@playwright/test').Page, api: ApiHelper) {
  const state = api.getLocalStorageState();
  await page.goto('/auth/login');
  await page.evaluate(
    ({ token, user }) => {
      localStorage.setItem('inventory_token', token);
      localStorage.setItem('inventory_user', user);
    },
    state,
  );
}

test.describe('Warehouses', () => {
  let api: ApiHelper;

  test.beforeAll(async () => {
    api = new ApiHelper();
    await api.register(TEST_USER);
  });

  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, api);
    await page.goto('/app/warehouses');
    await expect(page).toHaveURL(/\/app\/warehouses/);
  });

  test('TC-06: Crear almacén aparece en la lista', async ({ page }) => {
    const wh = new WarehousesPage(page);
    const name = `Almacén TC06 ${Date.now()}`;

    await wh.createWarehouse(name, 'Madrid');
    await wh.expectWarehouseVisible(name);
  });

  test('TC-07: Editar almacén actualiza los datos', async ({ page }) => {
    const wh = new WarehousesPage(page);
    // Create via API for reliable setup
    const warehouse = await api.createWarehouse({
      name: `Almacén TC07 ${Date.now()}`,
      location: 'Barcelona',
    });
    await page.reload();

    const updatedName = `${warehouse.name} Editado`;
    await wh.clickEdit(warehouse.name);

    // Clear and update the name field
    await wh.nameInput.fill(updatedName);
    await wh.saveForm();

    await wh.expectWarehouseVisible(updatedName);
  });

  test('TC-08: Eliminar almacén requiere confirmación y lo elimina', async ({ page }) => {
    const wh = new WarehousesPage(page);
    const warehouse = await api.createWarehouse({
      name: `Almacén TC08 ${Date.now()}`,
      location: 'Valencia',
    });
    await page.reload();

    await wh.expectWarehouseVisible(warehouse.name);
    await wh.clickDelete(warehouse.name);
    await wh.confirmDelete();

    await wh.expectWarehouseNotVisible(warehouse.name);
  });

  test('TC-09: Navegar al detalle del almacén muestra sus productos', async ({ page }) => {
    const wh = new WarehousesPage(page);
    const warehouse = await api.createWarehouse({
      name: `Almacén TC09 ${Date.now()}`,
      location: 'Sevilla',
    });
    await page.reload();

    await wh.clickViewProducts(warehouse.name);

    // Should navigate to the detail page
    await expect(page).toHaveURL(new RegExp(`/app/warehouses/${warehouse.id}`));
    // Products section heading is visible
    await expect(page.getByText('Productos')).toBeVisible();
  });
});
