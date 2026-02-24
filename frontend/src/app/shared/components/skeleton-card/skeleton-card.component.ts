import { Component } from '@angular/core';
import { Card } from 'primeng/card';
import { Skeleton } from 'primeng/skeleton';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  imports: [Card, Skeleton],
  templateUrl: 'skeleton-card.component.html',
})
export class SkeletonCardComponent {}
