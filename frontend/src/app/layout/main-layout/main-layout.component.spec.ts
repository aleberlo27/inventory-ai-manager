import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

import { MainLayoutComponent } from './main-layout.component';

describe('MainLayoutComponent', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
      schemas: [NO_ERRORS_SCHEMA],
    });

    fixture = TestBed.createComponent(MainLayoutComponent);
    fixture.detectChanges();
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render app-topbar', () => {
    expect(compiled.querySelector('app-topbar')).toBeTruthy();
  });

  it('should render router-outlet for main content', () => {
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should render app-ai-chat-sidebar', () => {
    expect(compiled.querySelector('app-ai-chat-sidebar')).toBeTruthy();
  });

  it('should have h-screen class on the root container', () => {
    expect(compiled.querySelector('.h-screen')).toBeTruthy();
  });

  it('should have a w-80 aside for the chat sidebar', () => {
    expect(compiled.querySelector('aside.w-80')).toBeTruthy();
  });
});
