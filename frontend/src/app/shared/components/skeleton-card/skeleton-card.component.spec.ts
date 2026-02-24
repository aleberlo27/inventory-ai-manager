import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import { SkeletonCardComponent } from './skeleton-card.component';

describe('SkeletonCardComponent', () => {
  let fixture: ComponentFixture<SkeletonCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonCardComponent],
      providers: [provideZonelessChangeDetection(), providePrimeNG({ theme: { preset: Aura } })],
    }).compileComponents();
    fixture = TestBed.createComponent(SkeletonCardComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a card with skeleton elements', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('p-card, .p-card')).toBeTruthy();
  });
});
