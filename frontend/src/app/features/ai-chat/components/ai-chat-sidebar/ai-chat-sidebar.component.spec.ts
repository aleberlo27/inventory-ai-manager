import { TestBed, ComponentFixture } from '@angular/core/testing';
import {
  NO_ERRORS_SCHEMA,
  provideZonelessChangeDetection,
  signal,
  WritableSignal,
} from '@angular/core';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { provideTranslateService } from '@ngx-translate/core';

import { AiChatSidebarComponent } from './ai-chat-sidebar.component';
import { ChatService } from '../../services/chat.service';
import type { ChatMessage, ProductLink } from '@shared/types';

describe('AiChatSidebarComponent', () => {
  let component: AiChatSidebarComponent;
  let fixture: ComponentFixture<AiChatSidebarComponent>;
  let mockChatService: {
    messages: WritableSignal<ChatMessage[]>;
    loading: WritableSignal<boolean>;
    sendMessage: jest.Mock;
    clearHistory: jest.Mock;
  };
  let mockRouter: { navigate: jest.Mock };

  beforeEach(() => {
    mockChatService = {
      messages: signal<ChatMessage[]>([]),
      loading: signal(false),
      sendMessage: jest.fn().mockReturnValue(of({ reply: 'OK' })),
      clearHistory: jest.fn(),
    };
    mockRouter = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      imports: [AiChatSidebarComponent],
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: Router, useValue: mockRouter },
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(AiChatSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe('welcome screen', () => {
    it('shows the welcome screen when there are no messages', () => {
      const welcome = fixture.nativeElement.querySelector('[data-testid="welcome-screen"]');
      expect(welcome).toBeTruthy();
    });

    it('shows the three suggestion buttons when there are no messages', () => {
      const suggestions = fixture.nativeElement.querySelectorAll('[data-testid="suggestion-btn"]');
      expect(suggestions.length).toBe(3);
    });

    it('calls sendMessage when a suggestion is clicked', () => {
      const btn = fixture.nativeElement.querySelector('[data-testid="suggestion-btn"]');
      btn.click();
      expect(mockChatService.sendMessage).toHaveBeenCalled();
    });

    it('hides welcome screen when there are messages', () => {
      mockChatService.messages.set([
        { id: '1', role: 'user', content: 'Hello', timestamp: new Date() },
      ]);
      fixture.detectChanges();
      const welcome = fixture.nativeElement.querySelector('[data-testid="welcome-screen"]');
      expect(welcome).toBeNull();
    });
  });

  describe('message actions', () => {
    it('calls chatService.sendMessage when onSendMessage is called', () => {
      component.onSendMessage('Test message');
      expect(mockChatService.sendMessage).toHaveBeenCalledWith('Test message');
    });

    it('calls chatService.clearHistory when onClearHistory is called', () => {
      component.onClearHistory();
      expect(mockChatService.clearHistory).toHaveBeenCalled();
    });

    it('navigates to the warehouse when onNavigateTo is called', () => {
      const link: ProductLink = { label: 'Ver almacén', warehouseId: 'wh-1' };
      component.onNavigateTo(link);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/app/warehouses', 'wh-1']);
    });
  });

  describe('loading indicator', () => {
    it('shows typing indicator when loading is true', () => {
      mockChatService.loading.set(true);
      fixture.detectChanges();
      const indicator = fixture.nativeElement.querySelector('[data-testid="typing-indicator"]');
      expect(indicator).toBeTruthy();
    });

    it('hides typing indicator when loading is false', () => {
      const indicator = fixture.nativeElement.querySelector('[data-testid="typing-indicator"]');
      expect(indicator).toBeNull();
    });
  });
});
