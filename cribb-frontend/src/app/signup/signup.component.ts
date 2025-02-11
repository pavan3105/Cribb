import { Component, OnInit } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { ionLockClosed } from '@ng-icons/ionicons';
import { FormsModule } from '@angular/forms';
import { initFlowbite } from 'flowbite';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  standalone: true,
  imports: [
    NgIcon,
    FormsModule
  ],
  viewProviders: [provideIcons({ ionLockClosed })]
})
export class SignupComponent implements OnInit {
  // Form data
  signupData = {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: ''
  };

  joinGroupData = {
    password: '',
    aptNo: ''
  };

  createGroupData = {
    name: '',
    aptNo: ''
  };

  ngOnInit(): void {
    // Initialize Flowbite when component mounts
    initFlowbite();
  }

  signup() {
    console.log('Signup data:', this.signupData);
    // Implement signup logic
  }

  joinGroup() {
    console.log('Joining group:', this.joinGroupData);
    // Implement join group logic
    
    // Close modal after submission
    const modal = document.getElementById('join-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }

  createGroup() {
    console.log('Creating group:', this.createGroupData);
    // Implement create group logic
    
    // Close modal after submission
    const modal = document.getElementById('create-modal');
    if (modal) {
      modal.classList.add('hidden');
    }
  }
}