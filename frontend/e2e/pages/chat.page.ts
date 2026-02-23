import { Page, expect } from '@playwright/test';

/**
 * Page Object for the AI Chat sidebar (always visible after login).
 */
export class ChatPage {
  constructor(private page: Page) {}

  // — Selectors —
  get sidebar() {
    return this.page.locator('app-ai-chat-sidebar');
  }
  get chatInput() {
    return this.page.locator('app-chat-input textarea');
  }
  get sendButton() {
    return this.page.locator('app-chat-input p-button button');
  }
  get welcomeScreen() {
    return this.page.locator('[data-testid="welcome-screen"]');
  }
  get suggestions() {
    return this.page.locator('[data-testid="suggestion-btn"]');
  }
  get typingIndicator() {
    return this.page.locator('[data-testid="typing-indicator"]');
  }
  get userMessages() {
    return this.page.locator('[data-testid="user-bubble"]');
  }
  get assistantMessages() {
    return this.page.locator('[data-testid="assistant-bubble"]');
  }
  get clearButton() {
    // The clear button is the trash icon button in the sidebar header
    return this.page.locator('app-ai-chat-sidebar button[title]');
  }
  get productNavigateButton() {
    return this.page.locator('[data-testid="navigate-btn"]');
  }

  // — Actions —
  async sendMessage(text: string) {
    await this.chatInput.fill(text);
    await this.sendButton.click();
  }

  async waitForAssistantResponse(expectedCount = 1) {
    await expect(this.assistantMessages).toHaveCount(expectedCount, { timeout: 20000 });
  }

  async clearHistory() {
    await this.clearButton.click();
  }

  async clickSuggestion(index = 0) {
    await this.suggestions.nth(index).click();
  }

  // — Assertions —
  async expectSidebarVisible() {
    await expect(this.sidebar).toBeVisible();
  }

  async expectWelcomeScreen() {
    await expect(this.welcomeScreen).toBeVisible();
  }

  async expectMessageCount(total: number) {
    const all = this.page.locator('[data-testid="user-bubble"], [data-testid="assistant-bubble"]');
    await expect(all).toHaveCount(total);
  }

  async expectTypingVisible() {
    await expect(this.typingIndicator).toBeVisible();
  }
}
