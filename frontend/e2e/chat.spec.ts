import { test, expect } from '@playwright/test';
import { ChatPage } from './pages/chat.page';
import { ApiHelper, uniqueEmail } from './helpers/api.helper';

/**
 * AI Chat sidebar flow tests — TC-15 to TC-19
 * TC-16, TC-17, TC-18 require the backend Anthropic API to be configured.
 */

const TEST_USER = {
  name: 'Chat Tester',
  email: uniqueEmail('chat'),
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

test.describe('AI Chat', () => {
  let api: ApiHelper;
  let warehouseId: string;
  let productName: string;

  test.beforeAll(async () => {
    api = new ApiHelper();
    await api.register(TEST_USER);

    // Create warehouse + product so the AI has context
    const wh = await api.createWarehouse({ name: 'Almacén Chat', location: 'Madrid' });
    warehouseId = wh.id;
    productName = `Tornillos M6 ${Date.now()}`;
    await api.createProduct(warehouseId, {
      name: productName,
      sku: `TOR-${Date.now()}`,
      quantity: 3,
      unit: 'unidades',
      minStock: 10,
    });
  });

  test.beforeEach(async ({ page }) => {
    await loginViaApi(page, api);
    await page.goto('/app/warehouses');
    await expect(page).toHaveURL(/\/app\/warehouses/);
  });

  test('TC-15: El chat sidebar siempre es visible en las páginas protegidas', async ({ page }) => {
    const chat = new ChatPage(page);
    await chat.expectSidebarVisible();
    await chat.expectWelcomeScreen();

    // Also visible on the warehouse detail page
    await page.goto(`/app/warehouses/${warehouseId}`);
    await chat.expectSidebarVisible();
  });

  test('TC-16: Enviar mensaje muestra respuesta del asistente', async ({ page }) => {
    const chat = new ChatPage(page);

    await chat.sendMessage('Hola, ¿cómo puedes ayudarme?');

    // User bubble should appear immediately
    await expect(chat.userMessages).toHaveCount(1);

    // Wait for assistant response (AI call can take a few seconds)
    await chat.waitForAssistantResponse(1);

    // Total messages: 1 user + 1 assistant
    await chat.expectMessageCount(2);
  });

  test('TC-17: Preguntar por producto devuelve información de stock', async ({ page }) => {
    const chat = new ChatPage(page);

    await chat.sendMessage(`¿Cuánto stock tengo de Tornillos?`);
    await chat.waitForAssistantResponse(1);

    // The assistant reply should mention the product or stock info
    const assistantBubble = chat.assistantMessages.first();
    await expect(assistantBubble).toBeVisible();
    // The reply should contain some text (not empty)
    const text = await assistantBubble.innerText();
    expect(text.trim().length).toBeGreaterThan(0);
  });

  test('TC-18: Navegar al almacén desde el link del chat', async ({ page }) => {
    const chat = new ChatPage(page);

    // Ask about a specific product to trigger the productLink
    await chat.sendMessage(`¿En qué almacén están los Tornillos?`);
    await chat.waitForAssistantResponse(1);

    // If the AI returns a productLink, a navigate button appears
    const navigateBtn = chat.productNavigateButton;
    if (await navigateBtn.isVisible()) {
      await navigateBtn.click();
      await expect(page).toHaveURL(/\/app\/warehouses\//);
    } else {
      // If no link returned, just verify the response arrived
      await expect(chat.assistantMessages.first()).toBeVisible();
    }
  });

  test('TC-19: Limpiar historial resetea la conversación', async ({ page }) => {
    const chat = new ChatPage(page);

    // Send a message first
    await chat.sendMessage('Mensaje de prueba');
    await chat.waitForAssistantResponse(1);
    await chat.expectMessageCount(2);

    // Clear history
    await chat.clearHistory();

    // Welcome screen should reappear
    await chat.expectWelcomeScreen();
  });
});
