import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideTranslateService } from '@ngx-translate/core';

import { ChatMessageComponent } from './chat-message.component';
import type { ChatMessage, ProductLink } from '@shared/types';

const mockUserMessage: ChatMessage = {
  id: 'msg-1',
  role: 'user',
  content: 'Hello world',
  timestamp: new Date('2024-01-15T10:30:00'),
};

const mockProductLink: ProductLink = {
  label: 'Ver en almacén',
  warehouseId: 'wh-1',
  productId: 'p-1',
};

const mockAssistantMessage: ChatMessage = {
  id: 'msg-2',
  role: 'assistant',
  content: 'Hi there! You have 10 items.',
  timestamp: new Date('2024-01-15T10:31:00'),
  productLink: mockProductLink,
};

const mockAssistantNoLink: ChatMessage = {
  id: 'msg-3',
  role: 'assistant',
  content: 'No product found.',
  timestamp: new Date('2024-01-15T10:32:00'),
};

describe('ChatMessageComponent', () => {
  let component: ChatMessageComponent;
  let fixture: ComponentFixture<ChatMessageComponent>;

  function setup(message: ChatMessage) {
    TestBed.configureTestingModule({
      imports: [ChatMessageComponent],
      providers: [provideZonelessChangeDetection(), provideTranslateService({ fallbackLang: 'es' })],
      schemas: [NO_ERRORS_SCHEMA],
    });
    fixture = TestBed.createComponent(ChatMessageComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', message);
    fixture.detectChanges();
  }

  describe('user message', () => {
    beforeEach(() => setup(mockUserMessage));

    it('isUser returns true when role is user', () => {
      expect(component.isUser()).toBe(true);
    });

    it('isAssistant returns false when role is user', () => {
      expect(component.isAssistant()).toBe(false);
    });

    it('formattedTime returns a time string', () => {
      expect(component.formattedTime()).toMatch(/\d{2}:\d{2}/);
    });

    it('renders the user bubble with right-aligned class', () => {
      const bubble = fixture.nativeElement.querySelector('[data-testid="user-bubble"]');
      expect(bubble).toBeTruthy();
    });

    it('does not render assistant bubble', () => {
      const bubble = fixture.nativeElement.querySelector('[data-testid="assistant-bubble"]');
      expect(bubble).toBeNull();
    });

    it('does not show navigation button for user messages', () => {
      const btn = fixture.nativeElement.querySelector('[data-testid="navigate-btn"]');
      expect(btn).toBeNull();
    });
  });

  describe('assistant message with productLink', () => {
    beforeEach(() => setup(mockAssistantMessage));

    it('isAssistant returns true when role is assistant', () => {
      expect(component.isAssistant()).toBe(true);
    });

    it('isUser returns false when role is assistant', () => {
      expect(component.isUser()).toBe(false);
    });

    it('renders the assistant bubble', () => {
      const bubble = fixture.nativeElement.querySelector('[data-testid="assistant-bubble"]');
      expect(bubble).toBeTruthy();
    });

    it('shows navigation button when productLink is present', () => {
      const btn = fixture.nativeElement.querySelector('[data-testid="navigate-btn"]');
      expect(btn).toBeTruthy();
    });

    it('emits navigateTo with the productLink when navigation button is clicked', () => {
      const spy = jest.spyOn(component.navigateTo, 'emit');
      const btn = fixture.nativeElement.querySelector('[data-testid="navigate-btn"]');
      btn.click();
      expect(spy).toHaveBeenCalledWith(mockProductLink);
    });
  });

  describe('assistant message without productLink', () => {
    beforeEach(() => setup(mockAssistantNoLink));

    it('does not show navigation button when productLink is absent', () => {
      const btn = fixture.nativeElement.querySelector('[data-testid="navigate-btn"]');
      expect(btn).toBeNull();
    });
  });
});
