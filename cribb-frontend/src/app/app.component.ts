import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LandingComponent } from './landing/landing.component';

@Component({
  selector: 'app-root',
  standalone: true, // Add this line
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LandingComponent], // Add LandingComponent
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'cribb-frontend';
}
