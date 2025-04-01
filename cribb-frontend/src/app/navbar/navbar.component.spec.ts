/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { ApiService } from '../services/api.service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

xdescribe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['logout', 'getCurrentUser']);

    await TestBed.configureTestingModule({
      imports: [NavbarComponent], // Import the standalone component
      providers: [
        provideRouter([]), // Use provideRouter for routing
        { provide: ApiService, useValue: mockApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle the menu state', () => {
    expect(component.isMenuOpen).toBeFalse();

    component.toggleMenu();
    expect(component.isMenuOpen).toBeTrue();

    component.toggleMenu();
    expect(component.isMenuOpen).toBeFalse();
  });

  it('should call logout and navigate to login on sign out', () => {
    spyOn(component['router'], 'navigate'); // Spy on the router's navigate method

    component.signOut();

    expect(mockApiService.logout).toHaveBeenCalled();
    expect(component['router'].navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should return the user name if user is logged in', () => {
    const mockUser = { 
      id: 'user1',
      firstName: 'John', 
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
      roomNo: '101'
    };
    mockApiService.getCurrentUser.and.returnValue(mockUser);

    expect(component.userName).toBe('John Doe');
  });

  it('should return "User" if no user is logged in', () => {
    mockApiService.getCurrentUser.and.returnValue(null);

    expect(component.userName).toBe('User');
  });
});
