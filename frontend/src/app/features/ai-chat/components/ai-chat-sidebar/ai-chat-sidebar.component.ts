import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-ai-chat-sidebar',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: 'ai-chat-sidebar.component.html',
})
export class AiChatSidebarComponent {}
