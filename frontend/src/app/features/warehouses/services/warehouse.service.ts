import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { APP_CONSTANTS } from '@shared/constants/app.constants';
import type { Warehouse, CreateWarehouseDto, UpdateWarehouseDto, ApiResponse } from '@shared/types';

@Injectable({ providedIn: 'root' })
export class WarehouseService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${APP_CONSTANTS.API_URL}/warehouses`;

  getWarehouses(): Observable<Warehouse[]> {
    return this.http
      .get<ApiResponse<Warehouse[]>>(this.apiUrl)
      .pipe(map(res => res.data));
  }

  getWarehouseById(id: string): Observable<Warehouse> {
    return this.http
      .get<ApiResponse<Warehouse>>(`${this.apiUrl}/${id}`)
      .pipe(map(res => res.data));
  }

  createWarehouse(data: CreateWarehouseDto): Observable<Warehouse> {
    return this.http
      .post<ApiResponse<Warehouse>>(this.apiUrl, data)
      .pipe(map(res => res.data));
  }

  updateWarehouse(id: string, data: UpdateWarehouseDto): Observable<Warehouse> {
    return this.http
      .patch<ApiResponse<Warehouse>>(`${this.apiUrl}/${id}`, data)
      .pipe(map(res => res.data));
  }

  deleteWarehouse(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
