import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupComponent } from './signup.component';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ApiService } from '../services/api.service';

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;
  let apiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    apiService = jasmine.createSpyObj('ApiService', ['register']);

    await TestBed.configureTestingModule({
      imports: [
        SignupComponent,
        ReactiveFormsModule,
        RouterTestingModule
      ],
      providers: [
        FormBuilder,
        { provide: ApiService, useValue: apiService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize with empty forms', () => {
    expect(component.signupForm.get('firstName')?.value).toBe('');
    expect(component.signupForm.get('lastName')?.value).toBe('');
    expect(component.signupForm.get('username')?.value).toBe('');
    expect(component.signupForm.get('password')?.value).toBe('');
    expect(component.signupForm.get('phone')?.value).toBe('');
  });

  it('should have invalid signup form when empty', () => {
    expect(component.signupForm.valid).toBeFalsy();
  });

  it('should validate phone number format', () => {
    const phoneControl = component.signupForm.get('phone');
    
    phoneControl?.setValue('123'); // Invalid phone
    expect(phoneControl?.errors?.['pattern']).toBeTruthy();
    
    phoneControl?.setValue('1234567890'); // Valid phone
    expect(phoneControl?.errors).toBeNull();
  });

  it('should validate password requirements', () => {
    const passwordControl = component.signupForm.get('password');
    
    passwordControl?.setValue('short'); // Too short, no number
    expect(passwordControl?.errors?.['minlength']).toBeTruthy();
    expect(passwordControl?.errors?.['noNumber']).toBeTruthy();
    
    passwordControl?.setValue('validpassword123'); // Valid password
    expect(passwordControl?.errors).toBeNull();
  });

  it('should toggle password visibility', () => {
    expect(component.showPassword).toBeFalse();
    component.togglePasswordVisibility();
    expect(component.showPassword).toBeTrue();
  });

  it('should handle join group modal', () => {
    component.signupForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      password: 'password123',
      phone: '1234567890'
    });

    component.openJoinModal();
    expect(component.registrationType).toBe('join');
  });

  it('should handle create group modal', () => {
    component.signupForm.patchValue({
      firstName: 'John',
      lastName: 'Doe',
      username: 'johndoe',
      password: 'password123',
      phone: '1234567890'
    });

    component.openCreateModal();
    expect(component.registrationType).toBe('create');
  });
});
