import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { ChatService } from './chat.service';
import { APP_CONSTANTS } from '@shared/constants/app.constants';

const CHAT_URL = `${APP_CONSTANTS.API_URL}/ai/chat`;

describe('ChatService', () => {
  let service: ChatService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChatService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    service = TestBed.inject(ChatService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('messages is initially an empty array', () => {
    expect(service.messages()).toEqual([]);
  });

  it('loading is initially false', () => {
    expect(service.loading()).toBe(false);
  });

  describe('sendMessage()', () => {
    it('adds the user message immediately before the HTTP response', () => {
      service.sendMessage('Hello').subscribe();

      expect(service.messages()).toHaveLength(1);
      expect(service.messages()[0].role).toBe('user');
      expect(service.messages()[0].content).toBe('Hello');

      httpTesting.expectOne(CHAT_URL).flush({ data: { reply: 'Hi!' } });
    });

    it('sets loading to true during the request and false after', () => {
      service.sendMessage('Hello').subscribe();
      expect(service.loading()).toBe(true);

      httpTesting.expectOne(CHAT_URL).flush({ data: { reply: 'Hi!' } });
      expect(service.loading()).toBe(false);
    });

    it('adds the assistant response after HTTP response', () => {
      service.sendMessage('Hello').subscribe();
      httpTesting.expectOne(CHAT_URL).flush({ data: { reply: 'Hi there!' } });

      expect(service.messages()).toHaveLength(2);
      expect(service.messages()[1].role).toBe('assistant');
      expect(service.messages()[1].content).toBe('Hi there!');
    });

    it('includes productLink in assistant message if present in response', () => {
      const productLink = { label: 'Ver almacén', warehouseId: 'wh-1', productId: 'p-1' };
      service.sendMessage('Where are screws?').subscribe();
      httpTesting.expectOne(CHAT_URL).flush({ data: { reply: 'In warehouse 1', productLink } });

      expect(service.messages()[1].productLink).toEqual(productLink);
    });

    it('on error: adds an error assistant message and deactivates loading', () => {
      service.sendMessage('Hello').subscribe({ error: () => {} });
      httpTesting
        .expectOne(CHAT_URL)
        .flush({ message: 'Error' }, { status: 503, statusText: 'Service Unavailable' });

      expect(service.loading()).toBe(false);
      expect(service.messages().length).toBeGreaterThan(1);
      expect(service.messages().at(-1)?.role).toBe('assistant');
    });

    it('updates conversationHistory so second request includes previous exchange', () => {
      service.sendMessage('Hello').subscribe();
      httpTesting.expectOne(CHAT_URL).flush({ data: { reply: 'Hi!' } });

      service.sendMessage('Follow up').subscribe();
      const req = httpTesting.expectOne(CHAT_URL);
      expect(req.request.body.conversationHistory).toHaveLength(2);
      req.flush({ data: { reply: 'Response' } });
    });
  });

  describe('clearHistory()', () => {
    it('clears all messages', () => {
      service.sendMessage('Hello').subscribe();
      httpTesting.expectOne(CHAT_URL).flush({ data: { reply: 'Hi!' } });

      service.clearHistory();
      expect(service.messages()).toEqual([]);
    });

    it('clears conversation history so next request has empty history', () => {
      service.sendMessage('Hello').subscribe();
      httpTesting.expectOne(CHAT_URL).flush({ data: { reply: 'Hi!' } });

      service.clearHistory();
      service.sendMessage('New message').subscribe();
      const req = httpTesting.expectOne(CHAT_URL);
      expect(req.request.body.conversationHistory).toHaveLength(0);
      req.flush({ data: { reply: 'Response' } });
    });
  });
});
