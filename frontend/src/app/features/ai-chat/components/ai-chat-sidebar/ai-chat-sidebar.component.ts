import { AfterViewChecked, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';

import { ChatService } from '../../services/chat.service';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import type { ProductLink } from '@shared/types';

@Component({
  selector: 'app-ai-chat-sidebar',
  standalone: true,
  imports: [TranslatePipe, Button, Tooltip, ChatMessageComponent, ChatInputComponent],
  templateUrl: 'ai-chat-sidebar.component.html',
})
export class AiChatSidebarComponent implements AfterViewChecked {
  private readonly chatService = inject(ChatService);
  private readonly router = inject(Router);

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  readonly messages = this.chatService.messages;
  readonly loading = this.chatService.loading;

  readonly suggestions = [
    { key: 'AI_CHAT.SUGGESTION_1', text: '¿Qué productos tienen stock bajo?' },
    { key: 'AI_CHAT.SUGGESTION_2', text: '¿Cuánto stock tengo en total?' },
    { key: 'AI_CHAT.SUGGESTION_3', text: '¿En qué almacén hay más productos?' },
  ];

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  onSendMessage(message: string): void {
    this.chatService.sendMessage(message).subscribe();
  }

  onNavigateTo(link: ProductLink): void {
    this.router.navigate(['/app/warehouses', link.warehouseId]);
  }

  onClearHistory(): void {
    this.chatService.clearHistory();
  }

  private scrollToBottom(): void {
    const container = this.messageContainer?.nativeElement as HTMLElement | undefined;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
