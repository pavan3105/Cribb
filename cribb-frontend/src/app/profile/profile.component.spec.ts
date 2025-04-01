import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ProfileComponent } from './profile.component';
import { ApiService } from '../services/api.service';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';
import { provideRouter } from '@angular/router';
import { User } from '../models/user.model';

describe('ProfileComponent', () => {
  let component: ProfileComponent;
  let fixture: ComponentFixture<ProfileComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['isLoggedIn', 'getUserProfile', 'logout']);

    await TestBed.configureTestingModule({
      imports: [
        ProfileComponent, // Import the standalone component
        CommonModule, // Import CommonModule as required by the component
        NavbarComponent // Import NavbarComponent as it is used in the template
      ],
      providers: [
        provideRouter([]), // Use provideRouter for routing
        { provide: ApiService, useValue: mockApiService }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should redirect to login if user is not authenticated', () => {
    mockApiService.isLoggedIn.and.returnValue(false);

    component.ngOnInit();

    expect(mockApiService.isLoggedIn).toHaveBeenCalled();
  });

  it('should load user profile data on initialization', () => {
    // Create mock user data with all required properties from User interface
    const mockUserData: User = {
      id: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      roomNo: '101',
      groupId: 'group123',
      groupName: 'Pantry Pals'
    };
    
    mockApiService.isLoggedIn.and.returnValue(true);
    mockApiService.getUserProfile.and.returnValue(of(mockUserData));

    component.ngOnInit();

    expect(component.user).toEqual(mockUserData);
    expect(component.loading).toBeFalse();
    expect(component.error).toBeNull();
  });

  it('should handle errors when loading user profile data', () => {
    const mockError = { message: 'User not authenticated' };
    mockApiService.isLoggedIn.and.returnValue(true);
    mockApiService.getUserProfile.and.returnValue(throwError(() => mockError));

    component.ngOnInit();

    expect(mockApiService.logout).toHaveBeenCalled();
    expect(component.loading).toBeFalse();
  });

  it('should display a generic error message for non-authentication errors', () => {
    const mockError = { message: 'Server error' };
    mockApiService.isLoggedIn.and.returnValue(true);
    mockApiService.getUserProfile.and.returnValue(throwError(() => mockError));

    component.ngOnInit();

    expect(component.error).toBe('Failed to load profile data. Please try again.');
    expect(component.loading).toBeFalse();
  });
});
