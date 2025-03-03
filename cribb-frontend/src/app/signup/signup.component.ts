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

// Custom validator for group password (only letters, no numbers or special chars)
export function groupPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }
    
    const validFormat = /^[a-zA-Z]+$/.test(value);
    
    return !validFormat ? { invalidFormat: true } : null;
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
  showGroupPassword = false;

  // Modal instances
  private joinModal: Modal | null = null;
  private createModal: Modal | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.signupForm = this.formBuilder.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), passwordValidator()]]
    });

    this.joinGroupForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6), groupPasswordValidator()]],
      aptNo: ['', [Validators.required]]
    });

    this.createGroupForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      aptNo: ['', [Validators.required]]
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

  toggleGroupPasswordVisibility() {
    this.showGroupPassword = !this.showGroupPassword;
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
    
    // Stop and show validation errors if form is invalid
    if (this.signupForm.invalid) {
      return;
    }
    
    // If form is valid, open the join modal
    if (this.joinModal) {
      // Reset any previous join group form validation state
      this.joinSubmitted = false;
      this.joinModal.show();
    }
  }
  
  // Validate signup form and open Create modal if valid
  validateAndOpenCreateModal(): void {
    this.submitted = true;
    
    // Stop and show validation errors if form is invalid
    if (this.signupForm.invalid) {
      return;
    }
    
    // If form is valid, open the create modal
    if (this.createModal) {
      // Reset any previous create group form validation state
      this.createSubmitted = false;
      this.createModal.show();
    }
  }

  // Register the user and handle the response
  private registerUser(groupData?: any, isJoining: boolean = false): void {
    // Stop here if form is invalid (we already validated in the modal open step, but checking again)
    if (this.signupForm.invalid) {
      return;
    }
    
    console.log('Signup data:', this.signupForm.value);
    
    // Call API service to register user
    this.apiService.register(this.signupForm.value).subscribe({
      next: (response) => {
        console.log('Registration successful', response);
        
        if (groupData) {
          if (isJoining) {
            this.processJoinGroup(groupData, response);
          } else {
            this.processCreateGroup(groupData, response);
          }
        } else {
          // Navigate to profile or another page after registration
          this.router.navigate(['/profile']);
        }
      },
      error: (error) => {
        console.error('Registration failed', error);
        // Handle registration error
      }
    });
  }

  // Process join group request after successful registration
  private processJoinGroup(groupData: any, userResponse: any): void {
    console.log('Joining group with data:', groupData);
    
    // Here you would call the API to join the group
    // Using the response from registration (userResponse) if needed
    
    // For now, just simulate success and navigate
    console.log('Join group successful');
    this.router.navigate(['/profile']);
    
    // Close modal after successful operation
    this.closeJoinModal();
  }
  
  // Process create group request after successful registration
  private processCreateGroup(groupData: any, userResponse: any): void {
    console.log('Creating group with data:', groupData);
    
    // Here you would call the API to create the group
    // Using the response from registration (userResponse) if needed
    
    // For now, just simulate success and navigate
    console.log('Create group successful');
    this.router.navigate(['/profile']);
    
    // Close modal after successful operation
    this.closeCreateModal();
  }

  joinGroup() {
    this.joinSubmitted = true;
    
    // Stop here if join form is invalid
    if (this.joinGroupForm.invalid) {
      return;
    }
    
    // If the join form is valid, register user and join group
    this.registerUser(this.joinGroupForm.value, true);
  }

  createGroup() {
    this.createSubmitted = true;
    
    // Stop here if create form is invalid
    if (this.createGroupForm.invalid) {
      return;
    }
    
    // If the create form is valid, register user and create group
    this.registerUser(this.createGroupForm.value, false);
  }
}