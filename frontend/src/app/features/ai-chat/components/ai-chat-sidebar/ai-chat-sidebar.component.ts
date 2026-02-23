import { AfterViewChecked, Component, ElementRef, inject, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

import { ChatService } from '../../services/chat.service';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import type { ProductLink } from '@shared/types';

@Component({
  selector: 'app-ai-chat-sidebar',
  imports: [TranslateModule, ButtonModule, TooltipModule, ChatMessageComponent, ChatInputComponent],
  templateUrl: 'ai-chat-sidebar.component.html',
})
export class AiChatSidebarComponent implements AfterViewChecked {
  private readonly chatService = inject(ChatService);
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);

  @ViewChild('messageContainer') messageContainer!: ElementRef;

  readonly messages = this.chatService.messages;
  readonly loading = this.chatService.loading;

  readonly suggestions = [
    {
      key: 'AI_CHAT.SUGGESTION_1',
      text: this.translate.instant('AI_CHAT.SUGGESTION_1'),
    },
    {
      key: 'AI_CHAT.SUGGESTION_2',
      text: this.translate.instant('AI_CHAT.SUGGESTION_2'),
    },
    {
      key: 'AI_CHAT.SUGGESTION_3',
      text: this.translate.instant('AI_CHAT.SUGGESTION_3'),
    },
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

  get inputPlaceholder(): string {
    return this.translate.instant('AI_CHAT.INPUT_PLACEHOLDER');
  }

  get sendButtonLabel(): string {
    return this.translate.instant('AI_CHAT.SEND_BUTTON');
  }

  private scrollToBottom(): void {
    const container = this.messageContainer?.nativeElement as HTMLElement | undefined;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }
}
