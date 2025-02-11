import { Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {ionLockClosed} from '@ng-icons/ionicons';

@Component({
  selector: 'app-login',
  imports: [NgIcon],
  viewProviders: [provideIcons({ ionLockClosed })],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

}
