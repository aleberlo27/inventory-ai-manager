import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { TopbarComponent } from './topbar/topbar.component';
import { AiChatSidebarComponent } from '../../features/ai-chat/components/ai-chat-sidebar/ai-chat-sidebar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, TopbarComponent, AiChatSidebarComponent],
  templateUrl: 'main-layout.component.html',
})
export class MainLayoutComponent {}
