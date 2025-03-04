import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../services/api.service';
import { ChoreService, Chore, RecurringChore } from '../services/chore.service';

@Component({
  selector: 'app-chores',
  templateUrl: './chores.component.html',
  styleUrl: './chores.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class ChoresComponent implements OnInit {
  // Chores data
  chores: Chore[] = [];
  recurringChores: RecurringChore[] = [];
  
  // Component state
  loading = true;
  error: string | null = null;
  activeTab: 'all' | 'yours' | 'overdue' | 'completed' = 'all';
  
  // New chore form visibility and data
  showNewChoreForm = false;
  isRecurringChore = false;
  
  // New individual chore properties
  newIndividualChore = {
    title: '',
    description: '',
    assigned_to: '',
    due_date: this.formatDate(new Date()),
    points: 5
  };
  
  // New recurring chore properties
  newRecurringChore = {
    title: '',
    description: '',
    frequency: 'weekly' as 'daily' | 'weekly' | 'biweekly' | 'monthly',
    points: 5
  };
  
  // Group information
  groupName: string = 'Apartment 101'; // We'll get this from the ApiService later
  
  // Available roommates to assign chores to
  availableRoommates: {id: string, name: string, username: string}[] = [];
  
  constructor(
    private apiService: ApiService,
    private choreService: ChoreService
  ) {}
  
  ngOnInit(): void {
    this.loadGroupChores();
    this.loadRecurringChores();
    this.loadRoommates();
  }
  
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  loadRoommates(): void {
    // In a real app, you would get this from an API
    // For now, we'll use mock data
    const currentUser = this.apiService.getCurrentUser();
    
    // Mock roommates data
    this.availableRoommates = [
      { 
        id: '12345', 
        name: 'John Doe', 
        username: 'john_doe' 
      },
      { 
        id: '67890', 
        name: 'Jane Smith', 
        username: 'jane_smith' 
      },
      { 
        id: '45678', 
        name: 'Robert Johnson', 
        username: 'robert_johnson' 
      }
    ];
    
    // Add current user to roommates if they're logged in
    if (currentUser) {
      this.availableRoommates.push({
        id: currentUser.id,
        name: `${currentUser.firstName} ${currentUser.lastName}`,
        username: `${currentUser.firstName.toLowerCase()}_${currentUser.lastName.toLowerCase()}`
      });
    }
  }
  
  loadGroupChores(): void {
    this.loading = true;
    this.error = null;
    
    this.choreService.getGroupChores(this.groupName).subscribe({
      next: (chores) => {
        this.chores = chores;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading chores:', error);
        this.error = 'Failed to load chores. Please try again.';
        this.loading = false;
      }
    });
  }
  
  loadRecurringChores(): void {
    this.choreService.getRecurringChores(this.groupName).subscribe({
      next: (recurringChores) => {
        this.recurringChores = recurringChores;
      },
      error: (error) => {
        console.error('Error loading recurring chores:', error);
      }
    });
  }
  
  isOverdue(chore: Chore): boolean {
    return chore.status === 'overdue';
  }
  
  isYourTurn(chore: Chore): boolean {
    const currentUser = this.apiService.getCurrentUser();
    if (!currentUser) return false;
    
    const username = `${currentUser.firstName.toLowerCase()}_${currentUser.lastName.toLowerCase()}`;
    return chore.assigned_to === username;
  }
  
  completeChore(choreId: string): void {
    const currentUser = this.apiService.getCurrentUser();
    if (!currentUser) return;
    
    const username = `${currentUser.firstName.toLowerCase()}_${currentUser.lastName.toLowerCase()}`;
    
    this.choreService.completeChore(choreId, username).subscribe({
      next: (response) => {
        // Update local state
        const chore = this.chores.find(c => c.id === choreId);
        if (chore) {
          chore.status = 'completed';
        }
        
        console.log(`Chore completed! Earned ${response.points_earned} points. New score: ${response.new_score}`);
        
        // In a real app, you might want to show a success notification
      },
      error: (error) => {
        console.error('Error completing chore:', error);
        this.error = 'Failed to complete chore. Please try again.';
        setTimeout(() => this.error = null, 3000);
      }
    });
  }
  
  postponeChore(choreId: string): void {
    // Find the chore
    const chore = this.chores.find(c => c.id === choreId);
    if (!chore) return;
    
    // Calculate new due date (postpone by 2 days)
    const currentDueDate = new Date(chore.due_date);
    currentDueDate.setDate(currentDueDate.getDate() + 2);
    const newDueDate = currentDueDate.toISOString();
    
    // Update the chore
    this.choreService.updateChore({
      chore_id: choreId,
      due_date: newDueDate
    }).subscribe({
      next: (updatedChore) => {
        // Update local state
        const index = this.chores.findIndex(c => c.id === choreId);
        if (index !== -1) {
          this.chores[index] = updatedChore;
        }
        
        console.log('Chore postponed successfully!');
        
        // In a real app, you might want to show a success notification
      },
      error: (error) => {
        console.error('Error postponing chore:', error);
        this.error = 'Failed to postpone chore. Please try again.';
        setTimeout(() => this.error = null, 3000);
      }
    });
  }
  
  createNewChore(): void {
    if (this.isRecurringChore) {
      this.createRecurringChore();
    } else {
      this.createIndividualChore();
    }
  }
  
  createIndividualChore(): void {
    if (!this.newIndividualChore.title || !this.newIndividualChore.assigned_to) {
      this.error = "Please fill in all required fields.";
      setTimeout(() => this.error = null, 3000);
      return;
    }
    
    const choreData = {
      title: this.newIndividualChore.title,
      description: this.newIndividualChore.description,
      group_name: this.groupName,
      assigned_to: this.newIndividualChore.assigned_to,
      due_date: new Date(this.newIndividualChore.due_date).toISOString(),
      points: this.newIndividualChore.points
    };
    
    this.choreService.createIndividualChore(choreData).subscribe({
      next: (newChore) => {
        // Add the new chore to the list
        this.chores.unshift(newChore);
        
        // Reset the form
        this.resetChoreForm();
        
        console.log('Individual chore created successfully!');
      },
      error: (error) => {
        console.error('Error creating individual chore:', error);
        this.error = 'Failed to create chore. Please try again.';
        setTimeout(() => this.error = null, 3000);
      }
    });
  }
  
  createRecurringChore(): void {
    if (!this.newRecurringChore.title) {
      this.error = "Please provide a title for the recurring chore.";
      setTimeout(() => this.error = null, 3000);
      return;
    }
    
    // Show loading indicator
    this.loading = true;
    
    const choreData = {
      title: this.newRecurringChore.title,
      description: this.newRecurringChore.description,
      group_name: this.groupName,
      frequency: this.newRecurringChore.frequency,
      points: this.newRecurringChore.points
    };
    
    this.choreService.createRecurringChore(choreData).subscribe({
      next: (newRecurringChore) => {
        console.log('Recurring chore created successfully!');
        
        // Add the new recurring chore to the list
        this.recurringChores.unshift(newRecurringChore);
        
        // Also create a chore instance for this recurring chore
        // This ensures it shows up in the list immediately without requiring a reload
        const currentUser = this.apiService.getCurrentUser();
        const username = currentUser ? 
          `${currentUser.firstName.toLowerCase()}_${currentUser.lastName.toLowerCase()}` : 
          (this.availableRoommates.length > 0 ? this.availableRoommates[0].username : 'john_doe');
        
        // Create a new chore instance that will show up in the list
        const newChoreInstance: any = {
          id: 'chore' + Date.now(),
          title: newRecurringChore.title,
          description: newRecurringChore.description,
          group_name: this.groupName,
          assigned_to: username,
          due_date: new Date().toISOString(),
          points: newRecurringChore.points,
          status: 'pending',
          type: 'recurring',
          recurring_id: newRecurringChore.id
        };
        
        // Add this new instance to the chores array so it appears immediately
        this.chores.unshift(newChoreInstance);
        
        // Reset the form and hide loading indicator
        this.resetChoreForm();
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error creating recurring chore:', error);
        this.error = 'Failed to create recurring chore. Please try again.';
        setTimeout(() => this.error = null, 3000);
      }
    });
  }
  
  reloadChores(): void {
    // Clear current chores first
    this.chores = [];
    
    // Then load the updated list
    this.choreService.getGroupChores(this.groupName).subscribe({
      next: (chores) => {
        this.chores = chores;
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
        console.error('Error reloading chores:', error);
        this.error = 'Failed to load updated chores. Please refresh the page.';
        setTimeout(() => this.error = null, 3000);
      }
    });
  }
  
  deleteChore(choreId: string): void {
    this.choreService.deleteChore(choreId).subscribe({
      next: () => {
        // Remove the chore from the list
        this.chores = this.chores.filter(c => c.id !== choreId);
        console.log('Chore deleted successfully!');
      },
      error: (error) => {
        console.error('Error deleting chore:', error);
        this.error = 'Failed to delete chore. Please try again.';
        setTimeout(() => this.error = null, 3000);
      }
    });
  }
  
  toggleNewChoreForm(): void {
    this.showNewChoreForm = !this.showNewChoreForm;
    if (!this.showNewChoreForm) {
      this.resetChoreForm();
    }
  }
  
  resetChoreForm(): void {
    this.newIndividualChore = {
      title: '',
      description: '',
      assigned_to: '',
      due_date: this.formatDate(new Date()),
      points: 5
    };
    
    this.newRecurringChore = {
      title: '',
      description: '',
      frequency: 'weekly',
      points: 5
    };
    
    this.isRecurringChore = false;
    this.showNewChoreForm = false;
  }
  
  getUserDisplayName(username: string): string {
    const roommate = this.availableRoommates.find(r => r.username === username);
    return roommate ? roommate.name : username;
  }
  
  setActiveTab(tab: 'all' | 'yours' | 'overdue' | 'completed'): void {
    this.activeTab = tab;
  }
  
  get filteredChores(): Chore[] {
    const currentUser = this.apiService.getCurrentUser();
    const username = currentUser ? 
      `${currentUser.firstName.toLowerCase()}_${currentUser.lastName.toLowerCase()}` : '';
    
    switch (this.activeTab) {
      case 'yours':
        return this.chores.filter(chore => chore.assigned_to === username);
      case 'overdue':
        return this.chores.filter(chore => chore.status === 'overdue');
      case 'completed':
        return this.chores.filter(chore => chore.status === 'completed');
      default:
        return this.chores;
    }
  }
  
  getRecurringFrequencyLabel(frequency: string): string {
    switch (frequency) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'biweekly': return 'Bi-weekly';
      case 'monthly': return 'Monthly';
      default: return frequency;
    }
  }
}