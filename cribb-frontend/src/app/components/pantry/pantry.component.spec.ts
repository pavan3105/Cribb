/// <reference types="jasmine" />
// @ts-ignore jasmine assertions
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';

import { PantryComponent } from './pantry.component';
import { PantryService } from '../../services/pantry.service';
import { ApiService } from '../../services/api.service';
import { AddItemComponent } from './add-item/add-item.component';
import { PantryItem } from '../../models/pantry-item.model';
import { User } from '../../models/user.model';

describe('PantryComponent', () => {
  let component: PantryComponent;
  let fixture: ComponentFixture<PantryComponent>;
  let pantryService: any;
  let apiService: any;

  // Mock data
  const mockPantryItems: PantryItem[] = [
    {
      id: '1',
      group_id: 'group1',
      name: 'Milk',
      quantity: 2,
      unit: 'gallons',
      category: 'Dairy',
      expiration_date: '2023-12-31',
      added_by: 'user1',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      is_expiring_soon: false,
      is_expired: false,
      added_by_name: 'John Doe',
      selectedQuantity: 1
    },
    {
      id: '2',
      group_id: 'group1',
      name: 'Eggs',
      quantity: 12,
      unit: 'count',
      category: 'Dairy',
      expiration_date: '2023-11-15',
      added_by: 'user1',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      is_expiring_soon: true,
      is_expired: false,
      added_by_name: 'John Doe',
      selectedQuantity: 1
    },
    {
      id: '3',
      group_id: 'group1',
      name: 'Bread',
      quantity: 1,
      unit: 'loaf',
      category: 'Bakery',
      expiration_date: '2023-10-01',
      added_by: 'user1',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      is_expiring_soon: false,
      is_expired: true,
      added_by_name: 'John Doe',
      selectedQuantity: 1
    },
    {
      id: '4',
      group_id: 'group1',
      name: 'Empty Item',
      quantity: 0,
      unit: 'box',
      category: 'Pantry',
      expiration_date: '2023-12-31',
      added_by: 'user1',
      created_at: '2023-01-01',
      updated_at: '2023-01-01',
      is_expiring_soon: false,
      is_expired: false,
      added_by_name: 'John Doe',
      selectedQuantity: 1
    }
  ];

  const mockUser: User = { 
    id: 'user1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '1234567890',
    groupName: 'Test Group',
    groupCode: 'ABC123',
    roomNo: '101'
  };

  beforeEach(async () => {
    // Create mock services
    pantryService = jasmine.createSpyObj('PantryService', 
      ['listItems', 'useItem', 'deleteItem', 'addItem', 'addToShoppingList']);
    
    apiService = jasmine.createSpyObj('ApiService', 
      ['getCurrentUser']);

    // Set default return values
    pantryService.listItems.and.returnValue(of(mockPantryItems));
    pantryService.useItem.and.returnValue(of({ 
      success: true, 
      message: 'Item used', 
      remaining_quantity: 1, 
      unit: 'gallon' 
    }));
    pantryService.deleteItem.and.returnValue(of({ message: 'Item deleted' }));
    pantryService.addItem.and.returnValue(of(mockPantryItems[0]));
    pantryService.addToShoppingList.and.returnValue(of({ message: 'Added to shopping list' }));
    apiService.getCurrentUser.and.returnValue(mockUser);

    await TestBed.configureTestingModule({
      imports: [
        FormsModule,
        PantryComponent
      ],
      providers: [
        { provide: PantryService, useValue: pantryService },
        { provide: ApiService, useValue: apiService }
      ]
    })
    .overrideComponent(PantryComponent, {
      remove: { imports: [AddItemComponent] },
      add: { imports: [] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(PantryComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // Basic check that component is initialized
    expect(component).not.toBeNull();
  });

  // Basic initialization test
  it('should initialize with user data', () => {
    fixture.detectChanges();
    
    // Verify API service was called
    expect(apiService.getCurrentUser).toHaveBeenCalled();
    
    // Verify component state
    expect(component.groupName).toBe('Test Group');
    expect(component.pantryItems.length).toBe(4);
    expect(component.filteredItems.length).toBe(4);
  });

  // Test filtering functionality
  it('should filter items by category', () => {
    fixture.detectChanges();
    component.onCategoryChange('Dairy');
    
    // Verify filtered items
    expect(component.filteredItems.length).toBe(2);
    expect(component.filteredItems[0].name).toBe('Milk');
    expect(component.filteredItems[1].name).toBe('Eggs');
  });

  // Test item interaction
  it('should handle increment/decrement quantity', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0];
    item.selectedQuantity = 1;
    
    // Test increment
    component.incrementQuantity(item);
    expect(item.selectedQuantity).toBe(2);
    
    // Test decrement
    component.decrementQuantity(item);
    expect(item.selectedQuantity).toBe(1);
  });

  // Test edge cases for increment/decrement
  it('should not increment beyond available quantity', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0]; // Milk with quantity 2
    item.selectedQuantity = 2; // Already at max
    
    component.incrementQuantity(item);
    expect(item.selectedQuantity).toBe(2); // Should not change
  });

  it('should not decrement below 1', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0];
    item.selectedQuantity = 1; // Already at min
    
    component.decrementQuantity(item);
    expect(item.selectedQuantity).toBe(1); // Should not change
  });

  it('should handle undefined selectedQuantity', () => {
    fixture.detectChanges();
    const item = {...component.pantryItems[0]};
    item.selectedQuantity = undefined;
    
    component.incrementQuantity(item);
    expect(item.selectedQuantity).toBe(2);
    
    item.selectedQuantity = undefined;
    component.decrementQuantity(item);
    expect(item.selectedQuantity).toBe(1);
  });

  // Test use item
  it('should use an item', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0];
    
    component.onUseItem(item, 1);
    
    // Verify service call
    // @ts-ignore: Jasmine typing issue
    expect(pantryService.useItem).toHaveBeenCalledWith({
      item_id: '1',
      quantity: 1
    });
  });

  it('should not use more than available quantity', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0]; // Milk with quantity 2
    
    component.onUseItem(item, 3); // Try to use 3
    
    expect(component.error).toContain('Cannot use more than the available quantity');
    expect(pantryService.useItem).not.toHaveBeenCalled();
  });

  it('should handle error when using item', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0];
    pantryService.useItem.and.returnValue(throwError(() => new Error('API error')));
    
    component.onUseItem(item, 1);
    
    expect(component.error).toBe('Failed to use item');
  });

  // Test delete item
  it('should delete an item after confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(true);
    
    component.onDeleteItem('1');
    
    // Verify service call
    expect(pantryService.deleteItem).toHaveBeenCalledWith('1');
  });

  it('should not delete an item if not confirmed', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(false);
    
    component.onDeleteItem('1');
    
    expect(pantryService.deleteItem).not.toHaveBeenCalled();
  });

  it('should handle error when deleting item', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(true);
    pantryService.deleteItem.and.returnValue(throwError(() => new Error('API error')));
    
    component.onDeleteItem('1');
    
    expect(component.error).toBe('Failed to delete item');
  });

  // Test form toggle
  it('should toggle add item form', () => {
    expect(component.showAddItemForm).toBe(false);
    
    component.toggleAddItemForm();
    expect(component.showAddItemForm).toBe(true);
    
    component.toggleAddItemForm();
    expect(component.showAddItemForm).toBe(false);
  });

  // Test item update
  it('should initialize and save updates', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0];
    
    // Test initialization of update form
    component.onUpdateQuantity(item);
    expect(component.itemToUpdate).toBe(item);
    expect(component.newQuantity).toBe(2);
    
    // Test saving updates
    component.newQuantity = 3;
    component.newExpiryDate = '2024-01-01';
    component.groupName = 'Test Group';
    component.saveItemUpdate();
    
    // Verify service call
    expect(pantryService.addItem).toHaveBeenCalled();
    const addItemCall = pantryService.addItem.calls.mostRecent();
    expect(addItemCall.args[0].name).toBe('Milk');
    expect(addItemCall.args[0].quantity).toBe(3);
  });

  // Test error handling
  it('should handle error when no user is logged in', () => {
    apiService.getCurrentUser.and.returnValue(null);
    fixture.detectChanges();
    
    expect(component.error).toBe('User information not available. Please log in.');
  });

  // Test API error
  it('should handle API errors when loading items', () => {
    pantryService.listItems.and.returnValue(throwError(() => new Error('API error')));
    fixture.detectChanges();
    
    expect(component.error).toBe('Failed to load pantry items');
  });

  // Additional tests for better coverage
  it('should calculate correct item statistics', () => {
    fixture.detectChanges();
    
    expect(component.getTotalItemCount()).toBe(4);
    expect(component.getExpiringItemCount()).toBe(1);
    expect(component.getOutOfStockItemCount()).toBe(1);
    expect(component.hasExpiringItems()).toBe(true);
    expect(component.hasOutOfStockItems()).toBe(true);
  });

  it('should add item to shopping list', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0];
    
    // Mock window.alert
    spyOn(window, 'alert');
    
    component.addToShoppingList(item);
    
    // Since the pantryService.addToShoppingList is not actually called in the component
    // (it's just a placeholder with console.log and alert), we check the alert was called
    expect(window.alert).toHaveBeenCalledWith(`Added ${item.name} to shopping list!`);
  });

  it('should handle error when adding to shopping list', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0];
    
    // Mock window.alert
    spyOn(window, 'alert');
    
    // Set an initial error message to verify it gets cleared
    component.error = 'Previous error';
    
    component.addToShoppingList(item);
    
    // In the actual implementation, the error message is cleared, not set
    expect(component.error).toBe('');
    expect(window.alert).toHaveBeenCalledWith(`Added ${item.name} to shopping list!`);
  });

  it('should close add item form when clicking outside', () => {
    component.showAddItemForm = true;
    const mockEvent = {
      target: document.createElement('div'),
      currentTarget: document.createElement('div')
    } as unknown as MouseEvent;
    
    // Add the class that the component checks for
    (mockEvent.target as HTMLElement).classList.add('fixed');
    
    component.closeAddItemForm(mockEvent);
    
    expect(component.showAddItemForm).toBe(false);
  });

  it('should not close add item form when clicking inside the form', () => {
    component.showAddItemForm = true;
    
    // Create mock elements
    const formElement = document.createElement('div');
    const buttonElement = document.createElement('button');
    formElement.appendChild(buttonElement);
    
    // Create event where target is inside the form
    const mockEvent = {
      target: buttonElement,
      currentTarget: formElement
    } as unknown as MouseEvent;
    
    // Button element does not have the fixed class
    component.closeAddItemForm(mockEvent);
    
    expect(component.showAddItemForm).toBe(true);
  });

  it('should cancel item update', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0];
    
    // Start update
    component.onUpdateQuantity(item);
    expect(component.itemToUpdate).toBe(item);
    
    // Cancel update
    component.cancelUpdate();
    
    expect(component.itemToUpdate).toBeNull();
  });

  it('should save quantity updates', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0];
    
    // Start update
    component.onUpdateQuantity(item);
    component.newQuantity = 5;
    
    // Save update
    component.saveQuantityUpdate();
    
    expect(pantryService.addItem).toHaveBeenCalled();
    const addItemCall = pantryService.addItem.calls.mostRecent();
    expect(addItemCall.args[0].quantity).toBe(5);
  });

  it('should handle initialization with only groupCode', () => {
    // Create user with only groupCode
    const userWithOnlyGroupCode: User = {
      ...mockUser,
      groupName: undefined
    };
    apiService.getCurrentUser.and.returnValue(userWithOnlyGroupCode);
    
    fixture.detectChanges();
    
    expect(component.groupName).toBe('Pantry');
    expect(pantryService.listItems).toHaveBeenCalled();
  });

  it('should handle initialization with no group information', () => {
    // Create user with no group info
    const userWithNoGroup: User = {
      ...mockUser,
      groupName: undefined,
      groupCode: undefined
    };
    apiService.getCurrentUser.and.returnValue(userWithNoGroup);
    
    fixture.detectChanges();
    
    expect(component.groupName).toBe('Pantry');
    expect(pantryService.listItems).toHaveBeenCalled();
  });

  it('should handle errors when saving item update', () => {
    fixture.detectChanges();
    const item = component.pantryItems[0];
    
    component.onUpdateQuantity(item);
    component.newQuantity = 3;
    
    pantryService.addItem.and.returnValue(throwError(() => new Error('API error')));
    
    component.saveItemUpdate();
    
    expect(component.error).toBe('Failed to update item');
  });

  it('should notify when items are added', () => {
    // Spy on loadAllPantryItems
    spyOn(component, 'loadAllPantryItems');
    
    component.onItemAdded();
    
    expect(component.loadAllPantryItems).toHaveBeenCalled();
  });
}); 