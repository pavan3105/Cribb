import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css']
})
export class LandingComponent {
  constructor(private router: Router) {}

  navigate(path: string) {
    if (path === 'login') {
      this.router.navigate(['/login']);
    } else if (path === 'signup') {
      this.router.navigate(['/signup']);
    }
    else {
      this.router.navigate([path]);
    }
  }
}