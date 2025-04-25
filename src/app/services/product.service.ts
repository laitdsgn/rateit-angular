import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private apiUrl = 'http://localhost/API/api.php';

  constructor(private http: HttpClient) { }

  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}?action=getProducts`)
      .pipe(
        catchError(this.handleError<any>('getProducts', []))
      );
  }

  addProduct(product: Product): Observable<any> {
    return this.http.post(`${this.apiUrl}?action=createProduct`, product)
      .pipe(
        catchError(this.handleError<any>('addProduct'))
      );
  }

  rateProduct(productId: number, rating: number): Observable<any> {
    return this.http.post(`${this.apiUrl}?action=rateProduct`, { productId, rating })
      .pipe(
        catchError(this.handleError<any>('rateProduct'))
      );
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
