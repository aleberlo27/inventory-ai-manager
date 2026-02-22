import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-warehouse-detail',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: 'warehouse-detail.component.html',
})
export class WarehouseDetailComponent {}
