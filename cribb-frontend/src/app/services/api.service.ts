import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:3000/api'; // Change this to your actual API URL
  private isSimulatedMode = true; // Set to true for simulated responses

  constructor(private http: HttpClient) { }

  // Authentication related API calls
  login(email: string, password: string): Observable<any> {
    if (this.isSimulatedMode) {
      // Simulate successful login response
      console.log('Simulating login for:', email);
      
      // Create mock response
      const mockResponse = {
        success: true,
        token: 'simulated-jwt-token-' + Math.random().toString(36).substring(2),
        user: {
          id: '12345',
          email: email,
          firstName: 'John',
          lastName: 'Doe',
          phone: '1234567890'
        },
        message: 'Login successful'
      };
      
      // Return simulated response with a delay to mimic network request
      return of(mockResponse).pipe(
        delay(800), // 800ms delay to simulate network request
        tap(response => {
          // Store token in localStorage
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
          console.log('Login successful (simulated):', response);
        })
      );
    }
    
    // Real API call if not in simulated mode
    return this.http.post<any>(`${this.baseUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          // Store token in localStorage or handle auth state
          if (response && response.token) {
            localStorage.setItem('auth_token', response.token);
            if (response.user) {
              localStorage.setItem('user_data', JSON.stringify(response.user));
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  register(userData: any): Observable<any> {
    if (this.isSimulatedMode) {
      // Simulate successful registration
      console.log('Simulating registration for:', userData.email);
      
      // Create mock response
      const mockResponse = {
        success: true,
        token: 'simulated-jwt-token-' + Math.random().toString(36).substring(2),
        user: {
          id: 'user-' + Math.random().toString(36).substring(2),
          ...userData,
        },
        message: 'Registration successful'
      };
      
      return of(mockResponse).pipe(
        delay(1000), // 1000ms delay to simulate network request
        tap(response => {
          // Store token in localStorage
          localStorage.setItem('auth_token', response.token);
          localStorage.setItem('user_data', JSON.stringify(response.user));
          console.log('Registration successful (simulated):', response);
        })
      );
    }
    
    return this.http.post<any>(`${this.baseUrl}/auth/register`, userData)
      .pipe(
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    console.log('User logged out');
    // Add any additional logout logic here
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  // Get current user data
  getCurrentUser(): any {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }

  // User profile related API calls
  getUserProfile(): Observable<any> {
    if (this.isSimulatedMode) {
      const userData = this.getCurrentUser();
      
      if (!userData) {
        return throwError(() => new Error('User not authenticated'));
      }
      
      // Add some additional profile data
      const mockProfile = {
        ...userData,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
        aptNo: userData.aptNo || '101',
        groupId: userData.groupId || 'group-123',
      };
      
      return of(mockProfile).pipe(delay(800));
    }
    
    return this.http.get<any>(`${this.baseUrl}/users/profile`)
      .pipe(
        catchError(this.handleError)
      );
  }

  updateUserProfile(profileData: any): Observable<any> {
    if (this.isSimulatedMode) {
      const currentUser = this.getCurrentUser();
      
      if (!currentUser) {
        return throwError(() => new Error('User not authenticated'));
      }
      
      // Update the user data
      const updatedUser = {
        ...currentUser,
        ...profileData,
        updatedAt: new Date().toISOString()
      };
      
      // Save to localStorage
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      return of({
        success: true,
        user: updatedUser,
        message: 'Profile updated successfully'
      }).pipe(delay(800));
    }
    
    return this.http.put<any>(`${this.baseUrl}/users/profile`, profileData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Group related API calls
  joinGroup(groupPassword: string, aptNo: string): Observable<any> {
    if (this.isSimulatedMode) {
      const currentUser = this.getCurrentUser();
      
      if (!currentUser) {
        return throwError(() => new Error('User not authenticated'));
      }
      
      // Mock group data
      const mockGroup = {
        id: 'group-' + Math.random().toString(36).substring(2),
        name: 'Apartment ' + aptNo,
        password: groupPassword,
        members: [currentUser.id],
        createdAt: new Date().toISOString()
      };
      
      // Update user with group info
      const updatedUser = {
        ...currentUser,
        groupId: mockGroup.id,
        aptNo: aptNo
      };
      
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      return of({
        success: true,
        group: mockGroup,
        message: 'Successfully joined group'
      }).pipe(delay(1000));
    }
    
    return this.http.post<any>(`${this.baseUrl}/groups/join`, { password: groupPassword, aptNo })
      .pipe(
        catchError(this.handleError)
      );
  }

  createGroup(groupName: string, aptNo: string): Observable<any> {
    if (this.isSimulatedMode) {
      const currentUser = this.getCurrentUser();
      
      if (!currentUser) {
        return throwError(() => new Error('User not authenticated'));
      }
      
      // Generate random 6-letter group password
      const randomPassword = Array(6)
        .fill(0)
        .map(() => String.fromCharCode(65 + Math.floor(Math.random() * 26)))
        .join('');
      
      // Mock group data
      const mockGroup = {
        id: 'group-' + Math.random().toString(36).substring(2),
        name: groupName,
        password: randomPassword,
        members: [currentUser.id],
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id
      };
      
      // Update user with group info
      const updatedUser = {
        ...currentUser,
        groupId: mockGroup.id,
        aptNo: aptNo,
        isGroupAdmin: true
      };
      
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      return of({
        success: true,
        group: mockGroup,
        message: 'Group created successfully'
      }).pipe(delay(1000));
    }
    
    return this.http.post<any>(`${this.baseUrl}/groups/create`, { name: groupName, aptNo })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Generic error handler
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
