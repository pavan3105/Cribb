import { Component, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionLockClosed, ionEyeOutline, ionEyeOffOutline } from '@ng-icons/ionicons';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { initFlowbite, Modal } from 'flowbite';
import { ApiService } from '../services/api.service';
import { Router } from '@angular/router';

// Custom validator for password with at least one number
export function passwordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const hasNumber = /[0-9]/.test(value);
    
    return !hasNumber ? { noNumber: true } : null;
  };
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  standalone: true,
  imports: [
    NgIcon,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  viewProviders: [provideIcons({ ionLockClosed, ionEyeOutline, ionEyeOffOutline })]
})
export class SignupComponent implements OnInit {
  signupForm: FormGroup;
  joinGroupForm: FormGroup;
  createGroupForm: FormGroup;
  submitted = false;
  joinSubmitted = false;
  createSubmitted = false;
  
  // Password visibility toggles
  showPassword = false;
  loading = false;
  errorMessage: string | null = null;

  // Modal instances
  private joinModal: Modal | null = null;
  private createModal: Modal | null = null;
  private registeredUsername: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(8), passwordValidator()]]
    });

    this.joinGroupForm = this.formBuilder.group({
      group_name: ['', [Validators.required]]
    });

    this.createGroupForm = this.formBuilder.group({
      name: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    // Initialize Flowbite when component mounts
    initFlowbite();
    
    // Initialize modal instances
    const joinModalElement = document.getElementById('join-modal');
    const createModalElement = document.getElementById('create-modal');
    
    if (joinModalElement) {
      this.joinModal = new Modal(joinModalElement);
    }
    
    if (createModalElement) {
      this.createModal = new Modal(createModalElement);
    }
  }

  // Convenience getters for easy access to form fields
  get f() { return this.signupForm.controls; }
  get jf() { return this.joinGroupForm.controls; }
  get cf() { return this.createGroupForm.controls; }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Close modal methods
  closeJoinModal(): void {
    if (this.joinModal) {
      this.joinModal.hide();
    }
  }
  
  closeCreateModal(): void {
    if (this.createModal) {
      this.createModal.hide();
    }
  }

  // Validate signup form and open Join modal if valid
  validateAndOpenJoinModal(): void {
    this.submitted = true;
    this.errorMessage = null;
    
    // Stop and show validation errors if form is invalid
    if (this.signupForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // First register the user
    this.registerUser().subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.loading = false;
        
        // Store the username for joining the group
        this.registeredUsername = this.signupForm.value.username;
        
        // If form is valid, open the join modal
        if (this.joinModal) {
          // Reset any previous join group form validation state
          this.joinSubmitted = false;
          this.joinModal.show();
        }
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.errorMessage = 'Registration failed: ' + (error.message || 'Please try again');
        this.loading = false;
      }
    });
  }
  
  // Validate signup form and open Create modal if valid
  validateAndOpenCreateModal(): void {
    this.submitted = true;
    this.errorMessage = null;
    
    // Stop and show validation errors if form is invalid
    if (this.signupForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // First register the user
    this.registerUser().subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        this.loading = false;
        
        // Store the username for creating the group
        this.registeredUsername = this.signupForm.value.username;
        
        // If form is valid, open the create modal
        if (this.createModal) {
          // Reset any previous create group form validation state
          this.createSubmitted = false;
          this.createModal.show();
        }
      },
      error: (error) => {
        console.error('Registration failed', error);
        this.errorMessage = 'Registration failed: ' + (error.message || 'Please try again');
        this.loading = false;
      }
    });
  }

  // Register the user and return the Observable
  private registerUser() {
    // Format the data according to the API documentation
    const registrationData = {
      username: this.signupForm.value.username,
      password: this.signupForm.value.password,
      name: `${this.signupForm.value.firstName} ${this.signupForm.value.lastName}`,
      phone_number: this.signupForm.value.phone
    };
    
    console.log('Registration data:', registrationData);
    
    // Call API service to register user and return the Observable
    return this.apiService.register(registrationData);
  }

  joinGroup() {
    this.joinSubmitted = true;
    
    // Stop here if join form is invalid
    if (this.joinGroupForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // Join the group using the API
    this.apiService.joinGroup(
      this.registeredUsername, 
      this.joinGroupForm.value.group_name
    ).subscribe({
      next: (response) => {
        console.log('Join group successful', response);
        this.loading = false;
        
        // Close modal after successful operation
        this.closeJoinModal();
        
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Join group failed', error);
        this.errorMessage = 'Failed to join group: ' + (error.message || 'Please try again');
        this.loading = false;
      }
    });
  }

  createGroup() {
    this.createSubmitted = true;
    
    // Stop here if create form is invalid
    if (this.createGroupForm.invalid) {
      return;
    }
    
    this.loading = true;
    
    // Create the group using the API
    this.apiService.createGroup(this.createGroupForm.value.name).subscribe({
      next: (response) => {
        console.log('Create group successful', response);
        this.loading = false;
        
        // Close modal after successful operation
        this.closeCreateModal();
        
        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('Create group failed', error);
        this.errorMessage = 'Failed to create group: ' + (error.message || 'Please try again');
        this.loading = false;
      }
    });
  }
}