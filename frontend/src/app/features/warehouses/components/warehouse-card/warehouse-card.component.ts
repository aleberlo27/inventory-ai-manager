import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Badge } from 'primeng/badge';

import type { Warehouse } from '@shared/types';

@Component({
  selector: 'app-warehouse-card',
  standalone: true,
  imports: [DatePipe, TranslatePipe, Button, Card, Badge],
  templateUrl: 'warehouse-card.component.html',
})
export class WarehouseCardComponent {
  readonly warehouse = input.required<Warehouse>();
  readonly edit = output<Warehouse>();
  readonly delete = output<Warehouse>();
  readonly view = output<string>();

  onEdit(): void {
    this.edit.emit(this.warehouse());
  }

  onDelete(): void {
    this.delete.emit(this.warehouse());
  }

  onView(): void {
    this.view.emit(this.warehouse().id);
  }
}
