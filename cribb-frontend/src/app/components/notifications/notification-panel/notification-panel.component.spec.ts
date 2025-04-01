/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { NotificationPanelComponent } from './notification-panel.component';
import { NotificationService } from '../../../services/notification.service';
import { NotificationItemComponent } from '../notification-item/notification-item.component';
import { Notification, NotificationType } from '../../../models/notification.model';

describe('NotificationPanelComponent', () => {
  let component: NotificationPanelComponent;
  let fixture: ComponentFixture<NotificationPanelComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;

  // Mock notifications for testing
  const mockNotifications: Notification[] = [
    {
      id: '1',
      type: NotificationType.EXPIRED,
      message: 'Milk has expired',
      item_name: 'Milk',
      item_id: 'milk-123',
      is_read: false,
      created_at: '2023-10-12T10:30:00Z',
      group_id: 'group1',
      read_by: []
    },
    {
      id: '2',
      type: NotificationType.EXPIRING,
      message: 'Eggs are expiring soon',
      item_name: 'Eggs',
      item_id: 'eggs-123',
      is_read: true,
      created_at: '2023-10-11T09:15:00Z',
      group_id: 'group1',
      read_by: ['user1']
    }
  ];

  beforeEach(async () => {
    // Create mock service
    notificationService = jasmine.createSpyObj('NotificationService', 
      ['markAsRead', 'deleteNotification', 'notifications$']);
      
    // Set default return values
    notificationService.markAsRead.and.returnValue(of({ message: 'Notification marked as read' }));
    notificationService.deleteNotification.and.returnValue(of({ message: 'Notification deleted' }));
    notificationService.notifications$ = of(mockNotifications);

    await TestBed.configureTestingModule({
      imports: [
        NotificationPanelComponent,
        NotificationItemComponent
      ],
      providers: [
        { provide: NotificationService, useValue: notificationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationPanelComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    // @ts-ignore: Jasmine typing issue
    expect(component).toBeDefined();
  });

  it('should subscribe to notifications on init', () => {
    fixture.detectChanges();
    
    // @ts-ignore: Jasmine typing issue
    expect(component.notifications.length).toBe(2);
    // @ts-ignore: Jasmine typing issue
    expect(component.notifications[0].id).toBe('1');
  });

  it('should default to pantry tab', () => {
    fixture.detectChanges();
    
    // @ts-ignore: Jasmine typing issue
    expect(component.activeTab).toBe('pantry');
    
    // Check if pantry content is visible
    const pantryDiv = fixture.debugElement.query(By.css('div[*ngIf="activeTab === \'pantry\'"]'));
    // @ts-ignore: Jasmine typing issue
    expect(pantryDiv).toBeTruthy();
  });

  it('should switch tabs', () => {
    fixture.detectChanges();
    
    // Switch to chores tab
    component.switchTab('chores');
    fixture.detectChanges();
    
    // @ts-ignore: Jasmine typing issue
    expect(component.activeTab).toBe('chores');
    
    // Check if chores content is visible
    const choresDiv = fixture.debugElement.query(By.css('div[*ngIf="activeTab === \'chores\'"]'));
    // @ts-ignore: Jasmine typing issue
    expect(choresDiv).toBeTruthy();
  });

  it('should mark notification as read', () => {
    fixture.detectChanges();
    
    component.markAsRead('1');
    
    // @ts-ignore: Jasmine typing issue
    expect(notificationService.markAsRead).toHaveBeenCalledWith('1');
  });

  it('should delete notification', () => {
    fixture.detectChanges();
    
    component.deleteNotification('1');
    
    // @ts-ignore: Jasmine typing issue
    expect(notificationService.deleteNotification).toHaveBeenCalledWith('1');
  });

  it('should emit event when navigating to all notifications', () => {
    fixture.detectChanges();
    
    // Set up spy on output event
    spyOn(component.closeDropdown, 'emit');
    
    // Navigate to all
    component.navigateToAll();
    
    // @ts-ignore: Jasmine typing issue
    expect(component.closeDropdown.emit).toHaveBeenCalled();
  });

  it('should display notification items when there are notifications', () => {
    fixture.detectChanges();
    
    // Find notification items
    const notificationItems = fixture.debugElement.queryAll(By.css('app-notification-item'));
    
    // @ts-ignore: Jasmine typing issue
    expect(notificationItems.length).toBe(2);
  });

  it('should display empty state when there are no notifications', () => {
    // Set empty notifications
    component.notifications = [];
    fixture.detectChanges();
    
    // Find empty state message
    const emptyState = fixture.debugElement.query(By.css('.p-4.text-center'));
    
    // @ts-ignore: Jasmine typing issue
    expect(emptyState).toBeTruthy();
    // @ts-ignore: Jasmine typing issue
    expect(emptyState.nativeElement.textContent).toContain('No new notifications');
  });

  it('should cleanup subscriptions on destroy', () => {
    fixture.detectChanges();
    
    // Set up spy on subscription unsubscribe
    spyOn(component['subscription'], 'unsubscribe');
    
    // Destroy component
    component.ngOnDestroy();
    
    // @ts-ignore: Jasmine typing issue
    expect(component['subscription'].unsubscribe).toHaveBeenCalled();
  });
}); 