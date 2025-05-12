import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  addProductForm!: FormGroup;
  rateProductForm!: FormGroup;
  errorMessage: string = '';
  successMessage: string = '';
  selectedProductId: number | null = null;

  constructor(
    private titleService: Title,
    private productService: ProductService,
    public authService: AuthService, 
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.titleService.setTitle('Products');
    this.initForms();
    
    // Only load products if user is logged in
    if (this.authService.isLoggedIn()) {
      this.loadProducts();
    } else {
      this.errorMessage = 'Musisz być zalogowany, aby zobaczyć tę stronę.';
    }
  }

  loadProducts() {
    this.productService.getProducts().subscribe({
      next: (data) => {
        if (data) {
          this.products = data;
        } 
      },
      error: (error) => {
        this.errorMessage = 'Failed to load products';
        console.error('Error loading products', error);
      }
    });
  }

  initForms() {
    this.addProductForm = this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      category: ['default', [Validators.required, Validators.pattern('^(?!default$).*$')]]
    });

    this.rateProductForm = this.fb.group({
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]]
    });
  }

  showAddProductPopup() {
    const popup = document.querySelector('.popup-container-add') as HTMLElement;
    if (popup) {
      popup.classList.add('popup-container-active');
      this.addProductForm.reset({category: 'default'});
    }
  }
  
  showRateProductPopup(productId?: number) {
    this.selectedProductId = productId || null;
    const popup = document.querySelector('.popup-container-rate') as HTMLElement;
    if (popup) {
      popup.classList.add('popup-container-active');
      this.rateProductForm.reset();
    }
  }
  
  closePopup() {
    const popupAdd = document.querySelector('.popup-container-add') as HTMLElement;
    const popupRate = document.querySelector('.popup-container-rate') as HTMLElement;
    
    if (popupAdd) {
      popupAdd.classList.remove('popup-container-active');
    }
    
    if (popupRate) {
      popupRate.classList.remove('popup-container-active');
    }
    
    this.selectedProductId = null;
    this.errorMessage = '';
    this.successMessage = '';
  }

  submitAddProduct() {
    if (this.addProductForm.valid) {
      const product: Product = this.addProductForm.value;
      
      this.productService.addProduct(product).subscribe({
        next: (response) => {
          if (response.success || response.message) {
            this.successMessage = 'Dodano produkt pomyślnie.';
            this.closePopup();
            this.loadProducts(); 
          } else {
            this.errorMessage = 'Nie udało się dodać produktu.';
          }
        },
        error: (err) => {
          this.errorMessage = 'Wystąpił błąd podczas dodawania produktu.';
          console.error('Error adding product:', err);
        }
      });
    } else {
      this.errorMessage = 'Please fill out all required fields correctly';
    }
  }

  submitRateProduct() {
    if (this.rateProductForm.valid && this.selectedProductId !== null) {
      const rating = this.rateProductForm.get('rating')?.value;
      
      this.productService.rateProduct(this.selectedProductId, rating).subscribe({
        next: (response) => {
          if (response.success || response.message) {
            this.successMessage = 'Oceniono produkt pomyślnie.';
            this.closePopup();
            this.loadProducts(); 
          } else {
            this.errorMessage = 'Nie udało się ocenić produktu.';
          }
        },
        error: (err) => {
          this.errorMessage = 'Wystąpił błąd podczas oceniania produktu.';
          console.error('Error rating product:', err);
        }
      });
    } else {
      this.errorMessage = 'Please provide a valid rating';
    }
  }

  logout() {
    this.authService.logout();
  }
}
