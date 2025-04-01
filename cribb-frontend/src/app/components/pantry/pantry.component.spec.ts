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
      ['listItems', 'useItem', 'deleteItem', 'addItem']);
    
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
    expect(component.pantryItems.length).toBe(3);
    expect(component.filteredItems.length).toBe(3);
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

  // Test delete item
  it('should delete an item after confirmation', () => {
    fixture.detectChanges();
    spyOn(window, 'confirm').and.returnValue(true);
    
    component.onDeleteItem('1');
    
    // Verify service call
    expect(pantryService.deleteItem).toHaveBeenCalledWith('1');
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
}); 