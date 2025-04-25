import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, catchError, of } from 'rxjs';
import { Router } from '@angular/router';

interface User {
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost/API/api.php';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userString = sessionStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.currentUserSubject.next(user);
    }
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}?action=login`, {
      username,
      pass: password
    }).pipe(
      tap((response: any) => {
        if (response.success && response.user) {
          sessionStorage.setItem('user', JSON.stringify(response.user));
          this.currentUserSubject.next(response.user);
        }
      })
    );
  }

  logout() {
    sessionStorage.removeItem('user');
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  register(username: string, password: string, passwordRepeat: string): Observable<any> {
    if (password !== passwordRepeat) {
      return of({ success: false, error: 'Hasła nie są takie same!' });
    }

    if (username === '' || password === '' || passwordRepeat === '' || 
        password.length < 8 || password.length > 20) {
      return of({ 
        success: false, 
        error: 'Pola są puste lub hasło ma mniej niż 8 albo więcej niż 20 znaków!'
      });
    }

    return this.http.post(`${this.apiUrl}?action=createUser`, {
      username: username,
      pass: password
    }).pipe(
      tap((response: any) => {
        if (response.success || response.message) {
          // Registration successful, but don't log in automatically
          return response;
        }
      }),
      catchError(error => {
        console.error('Registration error:', error);
        return of({ 
          success: false, 
          error: 'Wystąpił błąd podczas rejestracji (Lub jest inny użytkownik o takiej nazwie)'
        });
      })
    );
  }
}
