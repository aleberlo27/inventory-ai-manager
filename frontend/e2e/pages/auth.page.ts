import { Page, expect } from '@playwright/test';

/**
 * Page Object for Login and Register pages.
 * Uses type-based selectors since labels are not linked to inputs via for/id.
 */
export class AuthPage {
  constructor(private page: Page) {}

  // — Selectors —
  get emailInput() {
    return this.page.locator('input[type="email"]');
  }
  get passwordInput() {
    return this.page.locator('input[type="password"]').first();
  }
  get confirmPasswordInput() {
    return this.page.locator('input[type="password"]').nth(1);
  }
  get nameInput() {
    return this.page.locator('input[type="text"]').first();
  }
  get loginButton() {
    return this.page.getByRole('button', { name: 'Iniciar sesión' });
  }
  get registerButton() {
    return this.page.getByRole('button', { name: 'Crear cuenta' });
  }
  get registerLink() {
    return this.page.getByText('¿No tienes cuenta? Regístrate');
  }
  get loginLink() {
    return this.page.getByText('¿Ya tienes cuenta? Inicia sesión');
  }
  get errorMessage() {
    return this.page.locator('.text-red-600');
  }

  // — Actions —
  async gotoLogin() {
    await this.page.goto('/auth/login');
  }

  async gotoRegister() {
    await this.page.goto('/auth/register');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }

  async register(name: string, email: string, password: string) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.confirmPasswordInput.fill(password);
    await this.registerButton.click();
  }

  // — Assertions —
  async expectLoginPage() {
    await expect(this.page).toHaveURL(/\/auth\/login/);
  }

  async expectRedirectedToWarehouses() {
    await expect(this.page).toHaveURL(/\/app\/warehouses/);
  }
}
