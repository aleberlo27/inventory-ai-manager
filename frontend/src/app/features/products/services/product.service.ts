import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { APP_CONSTANTS } from '@shared/constants/app.constants';
import type { Product, CreateProductDto, UpdateProductDto, ApiResponse } from '@shared/types';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = APP_CONSTANTS.API_URL;

  getProductsByWarehouse(warehouseId: string): Observable<Product[]> {
    return this.http
      .get<ApiResponse<Product[]>>(`${this.apiUrl}/warehouses/${warehouseId}/products`)
      .pipe(map(res => res.data));
  }

  getProductById(id: string): Observable<Product> {
    return this.http
      .get<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`)
      .pipe(map(res => res.data));
  }

  createProduct(warehouseId: string, data: CreateProductDto): Observable<Product> {
    return this.http
      .post<ApiResponse<Product>>(`${this.apiUrl}/warehouses/${warehouseId}/products`, data)
      .pipe(map(res => res.data));
  }

  updateProduct(id: string, data: UpdateProductDto): Observable<Product> {
    return this.http
      .patch<ApiResponse<Product>>(`${this.apiUrl}/products/${id}`, data)
      .pipe(map(res => res.data));
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
  }

  searchProducts(query: string): Observable<Product[]> {
    return this.http
      .get<ApiResponse<Product[]>>(`${this.apiUrl}/products/search?q=${query}`)
      .pipe(map(res => res.data));
  }
}
