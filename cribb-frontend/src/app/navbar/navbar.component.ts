import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  isMenuOpen = false;
  
  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  signOut() {
    this.apiService.logout();
    // Navigate to login page after logout
    this.router.navigate(['/login']);
  }

  get userName(): string {
    const user = this.apiService.getCurrentUser();
    return user ? `${user.firstName} ${user.lastName}` : 'User';
  }
}
