import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PantryService } from '../../services/pantry.service';
import { PantryItem } from '../../models/pantry-item.model';
import { AddItemComponent } from './add-item/add-item.component';
import { ApiService } from '../../services/api.service';

/**
 * PantryComponent manages the household's food inventory
 * Allows users to view, add, update and consume pantry items
 */
@Component({
  selector: 'app-pantry',
  templateUrl: './pantry.component.html',
  styleUrls: ['./pantry.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, AddItemComponent]
})
export class PantryComponent implements OnInit {
  // Main items collections 
  pantryItems: PantryItem[] = [];          // All pantry items
  filteredItems: PantryItem[] = [];        // Items filtered by current category selection
  totalItems: number = 0;                // Total number of items in the pantry
  expiredItems: number = 0;                // Total number of items in the pantry
  
  // Filter state
  selectedCategory: string = '';           // Currently selected category filter
  categories: string[] = [];               // Deprecated - using allCategories instead
  allCategories: string[] = [];            // All unique categories from pantry items
  
  // UI state
  loading: boolean = false;                // Loading indicator state
  error: string = '';                      // Error message to display
  showAddItemForm: boolean = false;        // Controls visibility of add item form
  
  // Household and update state
  groupName: string = '';                  // Current household/group name
  itemToUpdate: PantryItem | null = null;  // Item being updated (if any)
  newQuantity: number = 0;                 // New quantity for item updates
  newExpiryDate: string = '';              // New expiry date for item updates

  constructor(
    private pantryService: PantryService,  // Service for pantry CRUD operations
    private apiService: ApiService         // Service for user and auth operations
  ) {}

  /**
   * Stats calculation methods for the template
   * Used to display summary information in the UI
   */
  getTotalItemCount(): number {
    return this.pantryItems.length;
  }
  
  getExpiringItemCount(): number {
    return this.pantryItems.filter(item => item.is_expiring_soon).length;
  }
  
  getOutOfStockItemCount(): number {
    return this.pantryItems.filter(item => item.quantity <= 0).length;
  }
  
  hasExpiringItems(): boolean {
    return this.getExpiringItemCount() > 0;
  }
  
  hasOutOfStockItems(): boolean {
    return this.getOutOfStockItemCount() > 0;
  }

  /**
   * Initialize component by loading user data and pantry items
   */
  ngOnInit(): void {
    // Get the current authenticated user data
    const userData = this.apiService.getCurrentUser();
    
    if (userData) {
      // Try to get group name from different possible properties
      // This handles different user object structures
      if (userData.groupName) {
        this.groupName = userData.groupName;
        this.loadAllPantryItems();}
        else if (userData.groupCode) {
        // Fallback if we only have a group code
        this.groupName = 'Pantry'; 
        console.log('Using test group name. Consider implementing a getGroupDetails API call');
        this.loadAllPantryItems();
      } else {
        // Development fallback
        this.groupName = 'Pantry';
        console.log('Using hardcoded group name for testing');
        this.loadAllPantryItems();
      }
    } else {
      this.error = 'User information not available. Please log in.';
      console.log('No user data available. User might not be logged in.');
    }
  }

  /**
   * Load all pantry items for the current household
   * Gets the complete list regardless of category to populate filters
   */
  loadAllPantryItems(): void {
    if (!this.groupName) {
      this.error = 'No group name available. Please join a group.';
      return;
    }
    
    this.loading = true;
    this.error = '';
    
    // Load all items with no category filter
    this.pantryService.listItems(this.groupName, '')
      .subscribe({
        next: (items) => {
          // Initialize selectedQuantity tracking property for each item
          this.pantryItems = items.map(item => ({
            ...item,
            selectedQuantity: 1
          }));
          
          // Extract unique categories for the filter buttons
          this.allCategories = [...new Set(items.map(item => item.category))];
          
          // Apply any active category filter
          this.filterItems();
          
          this.loading = false;
          this.totalItems = this.getTotalItemCount()
          this.expiredItems = this.getExpiringItemCount()
        },
        error: (err) => {
          this.error = 'Failed to load pantry items';
          this.loading = false;
          console.error('Error loading pantry items:', err);
        }
      });
  }

  /**
   * Filter pantry items based on selected category
   * Updates filteredItems which drives the UI
   */
  filterItems(): void {
    if (!this.selectedCategory) {
      this.filteredItems = this.pantryItems; // Show all items
    } else {
      this.filteredItems = this.pantryItems.filter(
        item => item.category === this.selectedCategory
      );
    }
  }

  /**
   * Handle category filter selection
   * @param category - The selected category to filter by
   */
  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.filterItems();
  }

  /**
   * Increase the selected quantity for an item (for use action)
   * @param item - The pantry item to update
   */
  incrementQuantity(item: PantryItem): void {
    if (item.selectedQuantity === undefined) {
      item.selectedQuantity = 1;
    }
    
    if (item.selectedQuantity < item.quantity) {
      item.selectedQuantity++;
    }
  }
  
  /**
   * Decrease the selected quantity for an item (for use action)
   * @param item - The pantry item to update
   */
  decrementQuantity(item: PantryItem): void {
    if (item.selectedQuantity === undefined) {
      item.selectedQuantity = 1;
    }
    
    if (item.selectedQuantity > 1) {
      item.selectedQuantity--;
    }
  }

  /**
   * Mark a pantry item as used/consumed
   * @param item - The pantry item being used
   * @param quantity - How many units to use
   */
  onUseItem(item: PantryItem, quantity: number): void {
    if (quantity > item.quantity) {
      this.error = `Cannot use more than the available quantity (${item.quantity} ${item.unit})`;
      return;
    }
    
    this.pantryService.useItem({
      item_id: item.id,
      quantity: quantity
    }).subscribe({
      next: (response) => {
        this.loadAllPantryItems(); // Refresh the pantry list
      },
      error: (err) => {
        this.error = 'Failed to use item';
        console.error('Error using item:', err);
      }
    });
  }

  /**
   * Delete a pantry item completely
   * @param itemId - ID of the item to delete
   */
  onDeleteItem(itemId: string): void {
    if (confirm('Are you sure you want to delete this item?')) {
      this.pantryService.deleteItem(itemId)
        .subscribe({
          next: () => {
            this.loadAllPantryItems(); // Refresh the pantry list
          },
          error: (err) => {
            this.error = 'Failed to delete item';
            console.error('Error deleting item:', err);
          }
        });
    }
  }

  /**
   * Toggle visibility of the add item form/modal
   */
  toggleAddItemForm(): void {
    this.showAddItemForm = !this.showAddItemForm;
    console.log('Add item form visibility:', this.showAddItemForm);
  }

  /**
   * Handle event when a new item is added through the form
   */
  onItemAdded(): void {
    console.log('Item added event received');
    this.loadAllPantryItems(); // Refresh the pantry list
    this.showAddItemForm = false; // Close the add form
  }

  /**
   * Handle click event on the modal background
   * Only closes if clicking outside the form itself
   * @param event - Mouse event from the click
   */
  closeAddItemForm(event: MouseEvent): void {
    // Get the target element
    const target = event.target as HTMLElement;
    
    // Check if the click was on the modal backdrop (the outermost div)
    // This works by checking if the clicked element has the modal's class
    if (target.classList.contains('fixed')) {
      this.showAddItemForm = false;
      console.log('Modal closed by background click');
    }
  }
  
  /**
   * Add a pantry item to the shopping list (future feature)
   * @param item - The pantry item to add to shopping list
   */
  addToShoppingList(item: PantryItem): void {
    // Simple placeholder for future shopping list integration
    console.log('Adding to shopping list:', item.name);
    
    this.error = ''; // Clear any existing errors
    alert(`Added ${item.name} to shopping list!`);
    
    // Future API implementation would go here
  }

  /**
   * Begin the update process for an item
   * @param item - The pantry item to update
   */
  onUpdateQuantity(item: PantryItem): void {
    this.itemToUpdate = item;
    this.newQuantity = item.quantity;
    
    // Format the expiry date for the date input (YYYY-MM-DD format)
    if (item.expiration_date) {
      const date = new Date(item.expiration_date);
      this.newExpiryDate = date.toISOString().split('T')[0];
    } else {
      this.newExpiryDate = '';
    }
  }

  /**
   * Cancel the current item update
   */
  cancelUpdate(): void {
    this.itemToUpdate = null;
  }

  /**
   * Save both quantity and expiry date updates for the current item
   */
  saveItemUpdate(): void {
    if (!this.itemToUpdate || this.newQuantity < 0) {
      return;
    }

    // Format expiry date in ISO 8601/RFC3339 format
    let formattedExpiryDate: string | undefined = undefined;
    if (this.newExpiryDate) {
      // Create a date at end of day in local timezone, then convert to ISO string
      const expiryDate = new Date(this.newExpiryDate);
      expiryDate.setHours(23, 59, 59, 999);
      formattedExpiryDate = expiryDate.toISOString();
    }

    // Use the existing addItem endpoint to update the item
    this.pantryService.addItem({
      name: this.itemToUpdate.name,
      quantity: this.newQuantity,
      unit: this.itemToUpdate.unit,
      category: this.itemToUpdate.category,
      group_name: this.groupName,
      expiration_date: formattedExpiryDate
    }).subscribe({
      next: () => {
        this.loadAllPantryItems(); // Refresh the pantry list
        this.itemToUpdate = null;  // Exit update mode
      },
      error: (err) => {
        this.error = 'Failed to update item';
        console.error('Error updating item:', err);
      }
    });
  }

  /**
   * Legacy method - replaced by saveItemUpdate
   * @deprecated Use saveItemUpdate instead
   */
  saveQuantityUpdate(): void {
    this.saveItemUpdate();
  }
}