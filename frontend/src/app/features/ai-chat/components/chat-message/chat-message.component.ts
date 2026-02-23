import { Component, computed, input, output } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

import type { ChatMessage, ProductLink } from '@shared/types';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [ButtonModule, TooltipModule, TranslateModule],
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
