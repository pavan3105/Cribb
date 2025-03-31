import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { DashboardComponent } from './dashboard.component';
import { ApiService } from '../services/api.service';
import { provideRouter } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from '../navbar/navbar.component';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  let mockApiService: jasmine.SpyObj<ApiService>;

  beforeEach(async () => {
    mockApiService = jasmine.createSpyObj('ApiService', ['isLoggedIn', 'getUserProfile', 'logout']);

    await TestBed.configureTestingModule({
      imports: [
        DashboardComponent, // Import the standalone component
        CommonModule, // Import CommonModule as required by the component
        NavbarComponent // Import NavbarComponent as it is used in the template
      ],
      providers: [
        provideRouter([]), // Use provideRouter for routing
        { provide: ApiService, useValue: mockApiService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
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
    const mockUserData = { firstName: 'John', groupName: 'Test Group', roomNo: '101' };
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

  it('should toggle the drawer state', () => {
    expect(component.isDrawerOpen).toBeTrue();

    component.toggleDrawer();
    expect(component.isDrawerOpen).toBeFalse();

    component.toggleDrawer();
    expect(component.isDrawerOpen).toBeTrue();
  });
});
