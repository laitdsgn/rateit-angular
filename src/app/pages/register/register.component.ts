import { Component, OnInit } from '@angular/core';
import { FormComponent } from '../../components/form/form.component';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormComponent, CommonModule, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
  isLoginPage = false;
  registerForm!: FormGroup;
  errorMessage: string = '';
  
  constructor(
    private titleService: Title,
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Register');
    this.initForm();
    
    // If already logged in, redirect to products
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/products']);
    }
  }

  initForm() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
      passwordRepeat: ['', [Validators.required]]
    }, { 
      validators: this.passwordsMatchValidator 
    });
  }

  passwordsMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const passwordRepeat = form.get('passwordRepeat')?.value;
    
    if (password === passwordRepeat) {
      return null;
    }
    
    return { passwordsMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const username = this.registerForm.get('username')?.value;
      const password = this.registerForm.get('password')?.value;
      const passwordRepeat = this.registerForm.get('passwordRepeat')?.value;

      this.authService.register(username, password, passwordRepeat).subscribe({
        next: (response) => {
          if (response.success || response.message) {
            this.router.navigate(['/login']);
          } else {
            this.errorMessage = response.error || 'Registration failed.';
          }
        },
        error: (error) => {
          console.error('Registration error:', error);
          this.errorMessage = 'An error occurred during registration. Please try again.';
        }
      });
    }
  }
}
