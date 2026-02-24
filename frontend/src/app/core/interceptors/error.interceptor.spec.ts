import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { provideTranslateService } from '@ngx-translate/core';

import { errorInterceptor } from './error.interceptor';
import { AuthService } from '../../features/auth/services/auth.service';

describe('errorInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let mockAuthService: { logout: jest.Mock; isAuthenticated: jest.Mock; getToken: jest.Mock };
  let mockMessageService: { add: jest.Mock };
  let mockRouter: { navigate: jest.Mock };

  beforeEach(() => {
    mockAuthService = {
      logout: jest.fn(),
      isAuthenticated: jest.fn().mockReturnValue(false),
      getToken: jest.fn().mockReturnValue(null),
    };
    mockMessageService = { add: jest.fn() };
    mockRouter = { navigate: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: MessageService, useValue: mockMessageService },
        { provide: Router, useValue: mockRouter },
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
        provideTranslateService({ fallbackLang: 'es' }),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  });

  afterEach(() => httpMock.verify());

  it('should call logout and redirect on 401', () => {
    http.get('/api/secure').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/secure');
    req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(mockAuthService.logout).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/auth/login']);
  });

  it('should show toast message on status 0 (no connection)', () => {
    http.get('/api/any').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/any');
    req.flush(null, { status: 0, statusText: 'Unknown Error' });

    expect(mockMessageService.add).toHaveBeenCalledWith(
      expect.objectContaining({ severity: 'error' }),
    );
  });

  it('should propagate the error downstream', (done) => {
    http.get('/api/error').subscribe({
      error: (err) => {
        expect(err.status).toBe(500);
        done();
      },
    });

    const req = httpMock.expectOne('/api/error');
    req.flush({ message: 'Server error' }, { status: 500, statusText: 'Internal Server Error' });
  });
});
