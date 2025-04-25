import { Component, OnInit } from '@angular/core';
import { FormComponent } from '../../components/form/form.component';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  isLoginPage = true;
  loginForm!: FormGroup;
  errorMessage: string = '';
  
  constructor(
    private titleService: Title,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Login');
    this.initForm();
    

    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/products']);
    }
  }

  initForm() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;

      this.authService.login(username, password).subscribe({
        next: (response) => {
          if (response.success) {
            this.router.navigate(['/products']);
          } else {
            this.errorMessage = response.error || 'Login failed. Please check your credentials.';
          }
        },
        error: (error) => {
          console.error('Login error:', error);
          this.errorMessage = 'An error occurred during login. Please try again.';
        }
      });
    }
  }
}
