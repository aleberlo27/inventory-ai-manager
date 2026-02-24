import { test, expect } from '@playwright/test';
import { ProductsPage } from './pages/products.page';
import { ApiHelper, uniqueEmail } from './helpers/api.helper';

/**
 * Product CRUD flow tests — TC-10 to TC-14
 * Products live inside a warehouse detail page (/app/warehouses/:id).
 */

const TEST_USER = {
  name: 'Product Tester',
  email: uniqueEmail('prod'),
  password: 'password123',
};

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

test.describe('Products', () => {
  let api: ApiHelper;
  let warehouseId: string;

  test.beforeAll(async () => {
    api = new ApiHelper();
    await api.register(TEST_USER);
    const wh = await api.createWarehouse({ name: 'Almacén Productos', location: 'Madrid' });
    warehouseId = wh.id;
  });

  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, api);
    await page.goto(`/app/warehouses/${warehouseId}`);
    await expect(page).toHaveURL(new RegExp(`/app/warehouses/${warehouseId}`));
    // Wait for the product list to be visible
    await expect(
      page.getByRole('heading', { name: 'Productos', exact: true })
    ).toBeVisible();
  });

  test('TC-10: Crear producto aparece en la tabla', async ({ page }) => {
    const prod = new ProductsPage(page);
    const sku = `TC10-${Date.now()}`;

    await prod.addProductButton.click();

    // Fill form in the dialog
    const dialog = page.locator('p-dialog');
    await dialog.getByPlaceholder('Nombre').fill('Producto TC10');
    await dialog.getByPlaceholder('SKU').fill(sku);

    // Set quantity to 20
    const qtyInput = dialog.locator('p-inputNumber').first().locator('input');
    await qtyInput.click({ clickCount: 3 });
    await qtyInput.fill('20');

    // Select first unit from dropdown
    await dialog.locator('.p-select-dropdown').click();
    await page.locator('.p-select-option').first().click();

    await page.getByRole('button', { name: 'Crear Producto' }).click();

    // Product should appear in the table
    await prod.expectProductVisible('Producto TC10');
  });

  test('TC-11: Producto con stock bajo muestra badge naranja', async ({ page }) => {
    const prod = new ProductsPage(page);
    // Create product with quantity below minStock via API
    const sku = `TC11-${Date.now()}`;
    await api.createProduct(warehouseId, {
      name: 'Producto Stock Bajo',
      sku,
      quantity: 2,
      unit: 'unidades',
      minStock: 10,
    });
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Productos', exact: true })
    ).toBeVisible();

    // The p-tag should show "Stock bajo" for this product
    await prod.expectStockStatus('Producto Stock Bajo', 'Stock bajo');
  });

  test('TC-12: Filtrar productos por nombre', async ({ page }) => {
    const prod = new ProductsPage(page);
    // Create two products via API
    const ts = Date.now();
    await api.createProduct(warehouseId, {
      name: `Manzana ${ts}`,
      sku: `MAN-${ts}`,
      quantity: 5,
      unit: 'kg',
    });
    await api.createProduct(warehouseId, {
      name: `Naranja ${ts}`,
      sku: `NAR-${ts}`,
      quantity: 5,
      unit: 'kg',
    });
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Productos', exact: true })
    ).toBeVisible();

    // Filter by "Manzana"
    await prod.filterByName(`Manzana ${ts}`);

    await prod.expectProductVisible(`Manzana ${ts}`);
    await prod.expectProductNotVisible(`Naranja ${ts}`);
  });

  test('TC-13: Editar cantidad del producto', async ({ page }) => {
    const sku = `TC13-${Date.now()}`;
    await api.createProduct(warehouseId, {
      name: 'Producto TC13',
      sku,
      quantity: 10,
      unit: 'unidades',
    });
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Productos', exact: true })
    ).toBeVisible();

    const prod = new ProductsPage(page);
    await prod.clickEditRow('Producto TC13');

    // Update quantity in the edit dialog
    const dialog = page.locator('p-dialog');
    const qtyInput = dialog.locator('p-inputNumber').first().locator('input');
    await qtyInput.click({ clickCount: 3 });
    await qtyInput.fill('99');

    await page.getByRole('button', { name: 'Guardar Cambios' }).click();

    // Verify updated quantity is shown in the table
    const row = page.locator('p-table tbody tr', { hasText: 'Producto TC13' });
    await expect(row.getByText('99')).toBeVisible();
  });

  test('TC-14: Eliminar producto con confirmación', async ({ page }) => {
    const sku = `TC14-${Date.now()}`;
    await api.createProduct(warehouseId, {
      name: 'Producto TC14',
      sku,
      quantity: 5,
      unit: 'unidades',
    });
    await page.reload();
    await expect(
      page.getByRole('heading', { name: 'Productos', exact: true })
    ).toBeVisible();

    const prod = new ProductsPage(page);
    await prod.expectProductVisible('Producto TC14');

    await prod.clickDeleteRow('Producto TC14');
    await prod.confirmDelete();

    await prod.expectProductNotVisible('Producto TC14');
  });
});
