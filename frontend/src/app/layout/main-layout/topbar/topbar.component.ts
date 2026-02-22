import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: 'topbar.component.html',
})
export class TopbarComponent {}
