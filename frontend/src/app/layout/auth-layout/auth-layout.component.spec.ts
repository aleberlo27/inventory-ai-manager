import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

import { AuthLayoutComponent } from './auth-layout.component';

describe('AuthLayoutComponent', () => {
  let fixture: ComponentFixture<AuthLayoutComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AuthLayoutComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(AuthLayoutComponent);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a router-outlet', () => {
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should have a min-h-screen container', () => {
    expect(compiled.querySelector('.min-h-screen')).toBeTruthy();
  });

  it('should display an h1 with the app title', () => {
    expect(compiled.querySelector('h1')).toBeTruthy();
  });

  it('should have a centered layout', () => {
    expect(compiled.querySelector('.flex.items-center.justify-center')).toBeTruthy();
  });
});
