import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';

import { jwtInterceptor } from './jwt.interceptor';
import { AuthService } from '../../features/auth/services/auth.service';

describe('jwtInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;

  const setup = (token: string | null) => {
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: { getToken: () => token } },
        provideHttpClient(withInterceptors([jwtInterceptor])),
        provideHttpClientTesting(),
        provideZonelessChangeDetection(),
      ],
    });
    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
  };

  afterEach(() => httpMock.verify());

  it('should add Authorization header when a token exists', () => {
    setup('my-jwt-token');

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-jwt-token');
    req.flush({});
  });

  it('should NOT add Authorization header when no token exists', () => {
    setup(null);

    http.get('/api/test').subscribe();

    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.get('Authorization')).toBeNull();
    req.flush({});
  });
});
