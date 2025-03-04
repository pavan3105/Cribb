import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { catchError, tap, delay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = 'http://localhost:8080'; // Updated based on API documentation
  private isSimulatedMode = false; // Set to false to use actual API

  constructor(private http: HttpClient) { }

  // Authentication related API calls
  login(username: string, password: string): Observable<any> {
    if (this.isSimulatedMode) {
      // Simulate successful login response
      console.log('Simulating login for:', username);
      
      // Create mock response
      const mockResponse = {
        success: true,
        token: 'simulated-jwt-token-' + Math.random().toString(36).substring(2),
        user: {
          id: '12345',
          email: username,
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
    
    // Real API call to the backend
    return this.http.post<any>(`${this.baseUrl}/api/login`, { username, password })
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
      console.log('Simulating registration for:', userData.username);
      
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
    
    // Format the data according to the user-provided format
    // The userData already contains the right format from the component, so just pass it through
    
    return this.http.post<any>(`${this.baseUrl}/api/register`, userData)
      .pipe(
        tap(response => {
          // Store token if provided
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

  // Get auth token
  getAuthToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  // Add authorization header to requests
  private getAuthHeaders(): HttpHeaders {
    const token = this.getAuthToken();
    if (!token) {
      throw new Error('No auth token available');
    }
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
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
    
    try {
      const headers = this.getAuthHeaders();
      return this.http.get<any>(`${this.baseUrl}/api/users/profile`, { headers })
        .pipe(
          catchError(this.handleError)
        );
    } catch (error) {
      return throwError(() => new Error('User not authenticated'));
    }
  }

  // Group related API calls
  joinGroup(username: string, group_name: string): Observable<any> {
    if (this.isSimulatedMode) {
      const currentUser = this.getCurrentUser();
      
      if (!currentUser) {
        return throwError(() => new Error('User not authenticated'));
      }
      
      // Mock group data
      const mockGroup = {
        id: 'group-' + Math.random().toString(36).substring(2),
        name: group_name,
        members: [currentUser.id],
        createdAt: new Date().toISOString()
      };
      
      // Update user with group info
      const updatedUser = {
        ...currentUser,
        groupId: mockGroup.id,
      };
      
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      return of({
        success: true,
        group: mockGroup,
        message: 'Successfully joined group'
      }).pipe(delay(1000));
    }
    
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.baseUrl}/api/groups/join`, { 
      username, 
      group_name 
    }, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  createGroup(name: string): Observable<any> {
    if (this.isSimulatedMode) {
      const currentUser = this.getCurrentUser();
      
      if (!currentUser) {
        return throwError(() => new Error('User not authenticated'));
      }
      
      // Mock group data
      const mockGroup = {
        id: 'group-' + Math.random().toString(36).substring(2),
        name: name,
        members: [currentUser.id],
        createdAt: new Date().toISOString(),
        createdBy: currentUser.id
      };
      
      // Update user with group info
      const updatedUser = {
        ...currentUser,
        groupId: mockGroup.id,
        isGroupAdmin: true
      };
      
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      
      return of({
        success: true,
        group: mockGroup,
        message: 'Group created successfully'
      }).pipe(delay(1000));
    }
    
    const headers = this.getAuthHeaders();
    return this.http.post<any>(`${this.baseUrl}/api/groups`, { name }, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get group members
  getGroupMembers(group_name: string): Observable<any> {
    if (this.isSimulatedMode) {
      return of([
        {
          id: '1',
          username: 'user1',
          name: 'User One',
          phone_number: '1234567890',
          score: 10
        },
        {
          id: '2',
          username: 'user2',
          name: 'User Two',
          phone_number: '0987654321',
          score: 20
        }
      ]).pipe(delay(800));
    }
    
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.baseUrl}/api/groups/members?group_name=${encodeURIComponent(group_name)}`, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get users sorted by score
  getUsersByScore(): Observable<any> {
    if (this.isSimulatedMode) {
      return of([
        {
          id: '1',
          username: 'user1',
          name: 'User One',
          phone_number: '1234567890',
          score: 25
        },
        {
          id: '2',
          username: 'user2',
          name: 'User Two',
          phone_number: '0987654321',
          score: 15
        }
      ]).pipe(delay(800));
    }
    
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.baseUrl}/api/users/by-score`, { headers })
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
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
