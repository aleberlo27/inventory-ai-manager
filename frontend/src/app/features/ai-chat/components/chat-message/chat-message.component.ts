import { Component, computed, input, output } from '@angular/core';

import type { ChatMessage, ProductLink } from '@shared/types';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [],
  templateUrl: 'chat-message.component.html',
})
export class ChatMessageComponent {
  readonly message = input.required<ChatMessage>();
  readonly navigateTo = output<ProductLink>();

  readonly isUser = computed(() => this.message().role === 'user');
  readonly isAssistant = computed(() => this.message().role === 'assistant');
  readonly formattedTime = computed(() =>
    this.message().timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
  );

  onNavigateTo(): void {
    const link = this.message().productLink;
    if (link) {
      this.navigateTo.emit(link);
    }
  }
}
