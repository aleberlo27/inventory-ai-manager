/**
 * API Helper: creates test data via backend REST API before E2E tests.
 * Avoids relying on the UI for setup, making tests faster and more reliable.
 */

const BASE_URL = 'http://localhost:3000';

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: string;
  };
}

interface Warehouse {
  id: string;
  name: string;
  location: string;
  description?: string;
  createdAt: string;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  minStock: number;
  category?: string;
  warehouseId: string;
  createdAt: string;
}

export class ApiHelper {
  private token: string | null = null;
  private user: AuthResponse['user'] | null = null;

  async register(data: { name: string; email: string; password: string }): Promise<void> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Register failed (${res.status}): ${body}`);
    }
    const result = await res.json() as { data: AuthResponse };
    this.token = result.data.token;
    this.user = result.data.user;
  }

  async login(email: string, password: string): Promise<void> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Login failed (${res.status}): ${body}`);
    }
    const result = await res.json() as { data: AuthResponse };
    this.token = result.data.token;
    this.user = result.data.user;
  }

  async createWarehouse(data: {
    name: string;
    location: string;
    description?: string;
  }): Promise<Warehouse> {
    const res = await fetch(`${BASE_URL}/warehouses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Create warehouse failed (${res.status}): ${body}`);
    }
    const result = await res.json() as { data: Warehouse };
    return result.data;
  }

  async createProduct(
    warehouseId: string,
    data: {
      name: string;
      sku: string;
      quantity: number;
      unit: string;
      minStock?: number;
      category?: string;
    },
  ): Promise<Product> {
    const res = await fetch(`${BASE_URL}/warehouses/${warehouseId}/products`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify({ minStock: 5, ...data }),
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Create product failed (${res.status}): ${body}`);
    }
    const result = await res.json() as { data: Product };
    return result.data;
  }

  getToken(): string {
    if (!this.token) throw new Error('Not authenticated — call login() or register() first');
    return this.token;
  }

  getUser(): AuthResponse['user'] {
    if (!this.user) throw new Error('Not authenticated — call login() or register() first');
    return this.user;
  }

  /** Injects the JWT token and user into the browser localStorage so the app treats the session as authenticated. */
  getLocalStorageState(): { token: string; user: string } {
    return {
      token: this.getToken(),
      user: JSON.stringify(this.getUser()),
    };
  }
}

/** Generates a unique test email to avoid conflicts between test runs. */
export function uniqueEmail(prefix = 'e2e'): string {
  return `${prefix}+${Date.now()}@test.com`;
}
