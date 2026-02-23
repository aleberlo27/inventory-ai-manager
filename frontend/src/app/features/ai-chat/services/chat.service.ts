import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { map } from 'rxjs/operators';

import type { ApiResponse, ChatMessage, ChatResponse, ChatRole, ProductLink } from '@shared/types';
import { APP_CONSTANTS } from '@shared/constants/app.constants';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${APP_CONSTANTS.API_URL}/ai/chat`;

  private readonly messagesSignal = signal<ChatMessage[]>([]);
  private readonly loadingSignal = signal(false);

  readonly messages = this.messagesSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  private conversationHistory: Array<{ role: ChatRole; content: string }> = [];

  sendMessage(userMessage: string): Observable<ChatResponse> {
    const userMsg = this.createMessage('user', userMessage);
    this.messagesSignal.update(msgs => [...msgs, userMsg]);
    this.loadingSignal.set(true);

    return this.http
      .post<ApiResponse<ChatResponse>>(this.apiUrl, {
        message: userMessage,
        conversationHistory: this.conversationHistory,
      })
      .pipe(
        map(res => res.data),
        tap(response => {
          const assistantMsg = this.createMessage(
            'assistant',
            response.reply,
            response.productLink,
          );
          this.messagesSignal.update(msgs => [...msgs, assistantMsg]);
          this.conversationHistory.push(
            { role: 'user', content: userMessage },
            { role: 'assistant', content: response.reply },
          );
          this.loadingSignal.set(false);
        }),
        catchError(err => {
          const errorMsg = this.createMessage(
            'assistant',
            'Lo siento, ha ocurrido un error. Por favor, inténtalo de nuevo.',
          );
          this.messagesSignal.update(msgs => [...msgs, errorMsg]);
          this.loadingSignal.set(false);
          return throwError(() => err);
        }),
      );
  }

  clearHistory(): void {
    this.messagesSignal.set([]);
    this.conversationHistory = [];
  }

  private createMessage(role: ChatRole, content: string, productLink?: ProductLink): ChatMessage {
    return {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date(),
      productLink,
    };
  }
}
