import { Component, computed, input, output, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';

@Component({
  selector: 'app-chat-input',
  standalone: true,
  imports: [TranslatePipe, Textarea, Button],
  templateUrl: 'chat-input.component.html',
})
export class ChatInputComponent {
  readonly loading = input<boolean>(false);
  readonly send = output<string>();

  message = signal('');

  readonly canSend = computed(
    () =>
      this.message().trim().length > 0 &&
      this.message().trim().length <= 500 &&
      !this.loading(),
  );

  readonly characterCount = computed(() => this.message().trim().length);

  onSend(): void {
    if (this.canSend()) {
      this.send.emit(this.message().trim());
      this.message.set('');
    }
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }
}
