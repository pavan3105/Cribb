import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavbarComponent } from '../navbar/navbar.component';
import { ApiService } from '../services/api.service';
import { ChoresComponent } from '../chores/chores.component';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
  standalone: true,
  imports: [CommonModule, NavbarComponent, ChoresComponent]
})
export class DashboardComponent implements OnInit {
  isDrawerOpen = true;
  user: any = null;
  loading = true;
  error: string | null = null;
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}
  
  ngOnInit(): void {
    // Check if user is logged in
    if (!this.apiService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Load user profile data
    this.apiService.getUserProfile().subscribe({
      next: (userData) => {
        this.user = userData;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.error = 'Failed to load user data. Please try again.';
        this.loading = false;
      }
    });
  }
  
  toggleDrawer(): void {
    this.isDrawerOpen = !this.isDrawerOpen;
  }
}