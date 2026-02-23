import { test, expect } from '@playwright/test';
import { AuthPage } from './pages/auth.page';
import { ApiHelper, uniqueEmail } from './helpers/api.helper';

/**
 * Auth flow tests — TC-01 to TC-05
 * A shared test user is created once; each test navigates independently.
 */

const TEST_USER = {
  name: 'Test User',
  email: uniqueEmail('auth'),
  password: 'password123',
};

test.describe('Authentication', () => {
  // Create the shared user before the suite
  test.beforeAll(async () => {
    const api = new ApiHelper();
    await api.register(TEST_USER);
  });

  test('TC-01: Login exitoso redirige a almacenes', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.gotoLogin();
    await auth.login(TEST_USER.email, TEST_USER.password);
    await auth.expectRedirectedToWarehouses();
  });

  test('TC-02: Login con credenciales incorrectas muestra error', async ({ page }) => {
    const auth = new AuthPage(page);
    await auth.gotoLogin();
    await auth.login(TEST_USER.email, 'wrongpassword');
    // Error message appears (not redirected)
    await auth.expectLoginPage();
    await expect(auth.errorMessage).toBeVisible();
  });

  test('TC-03: Registro de nuevo usuario exitoso', async ({ page }) => {
    const auth = new AuthPage(page);
    const newEmail = uniqueEmail('reg');
    await auth.gotoRegister();
    await auth.register('New User', newEmail, 'password123');
    // After register → redirect to warehouses
    await auth.expectRedirectedToWarehouses();
  });

  test('TC-04: Ruta protegida redirige a login si no autenticado', async ({ page }) => {
    // Navigate directly to protected route without any session
    await page.goto('/app/warehouses');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('TC-05: Logout limpia la sesión y redirige a login', async ({ page }) => {
    const auth = new AuthPage(page);
    // Login first
    await auth.gotoLogin();
    await auth.login(TEST_USER.email, TEST_USER.password);
    await auth.expectRedirectedToWarehouses();

    // Open user menu (click avatar)
    await page.locator('p-avatar').click();
    // Click "Cerrar Sesión" in the popup menu
    await page.getByText('Cerrar Sesión').click();

    // Should be back on login
    await auth.expectLoginPage();

    // LocalStorage should be cleared
    const token = await page.evaluate(() => localStorage.getItem('inventory_token'));
    expect(token).toBeNull();
  });
});
