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
    const userId = this.getUserId();
    
    if (!userId) {
      return of({ success: false, error: 'User ID not found. Please log in again.' });
    }
    
    return this.http.post(`${this.apiUrl}?action=createReview`, { 
      user_id: userId,
      product_id: productId, 
      rating: rating 
    })
      .pipe(
        catchError(this.handleError<any>('rateProduct'))
      );
  }
  
  private getUserId(): number | null {
    const userString = sessionStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      return user.id;
    }
    return null;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      return of(result as T);
    };
  }
}
