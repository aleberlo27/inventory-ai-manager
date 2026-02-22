import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA, provideZonelessChangeDetection, signal } from '@angular/core';
import { Router, provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';

import { MainLayoutComponent } from './main-layout.component';
import { AuthService } from '../../features/auth/services/auth.service';

describe('MainLayoutComponent', () => {
  let fixture: ComponentFixture<MainLayoutComponent>;
  let compiled: HTMLElement;

  beforeEach(() => {
    const mockAuthService = {
      currentUser: signal(null),
      logout: jest.fn(),
    };

    TestBed.configureTestingModule({
      imports: [MainLayoutComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: { navigate: jest.fn(), url: '/', events: { pipe: jest.fn() } } },
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
