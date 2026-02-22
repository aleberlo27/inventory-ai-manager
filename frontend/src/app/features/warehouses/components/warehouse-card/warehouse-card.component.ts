import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { Button } from 'primeng/button';
import { Card } from 'primeng/card';
import { Badge } from 'primeng/badge';

import type { Warehouse } from '@shared/types';

@Component({
  selector: 'app-warehouse-card',
  standalone: true,
  imports: [TranslatePipe, Button, Card, Badge],
  templateUrl: 'warehouse-card.component.html',
})
export class WarehouseCardComponent {
  @Input({ required: true }) warehouse!: Warehouse;
  @Output() edit = new EventEmitter<Warehouse>();
  @Output() delete = new EventEmitter<Warehouse>();
  @Output() view = new EventEmitter<string>();

  onEdit(): void {
    this.edit.emit(this.warehouse);
  }

  onDelete(): void {
    this.delete.emit(this.warehouse);
  }

  onView(): void {
    this.view.emit(this.warehouse.id);
  }
}
