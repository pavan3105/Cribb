/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Overlay } from '@angular/cdk/overlay';
import { NotificationDropdownComponent } from './notification-dropdown.component';
import { NotificationService } from '../../../services/notification.service';

describe('NotificationDropdownComponent', () => {
  let component: NotificationDropdownComponent;
  let fixture: ComponentFixture<NotificationDropdownComponent>;
  let notificationService: jasmine.SpyObj<NotificationService>;
  let overlay: jasmine.SpyObj<Overlay>;

  beforeEach(async () => {
    // Create mock services
    notificationService = jasmine.createSpyObj('NotificationService', ['fetchNotifications', 'unreadCount$']);
    overlay = jasmine.createSpyObj('Overlay', ['position', 'create']);
    
    // Set default return values
    notificationService.fetchNotifications.and.returnValue(of([]));
    notificationService.unreadCount$ = of(5);
    
    // Mock overlay position builder
    const positionBuilder = jasmine.createSpyObj('PositionBuilder', ['flexibleConnectedTo']);
    positionBuilder.flexibleConnectedTo.and.returnValue({
      withPositions: jasmine.createSpy('withPositions').and.returnValue({})
    });
    overlay.position.and.returnValue(positionBuilder);
    
    // Mock overlay reference
    const overlayRefMock = jasmine.createSpyObj('OverlayRef', ['backdropClick', 'attach', 'dispose']);
    overlayRefMock.backdropClick.and.returnValue(of({}));
    overlay.create.and.returnValue(overlayRefMock);

    await TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NotificationDropdownComponent
      ],
      providers: [
        { provide: NotificationService, useValue: notificationService },
        { provide: Overlay, useValue: overlay }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationDropdownComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    // @ts-ignore: Jasmine typing issue
    expect(component).toBeDefined();
  });

  it('should initialize with unread count from service', () => {
    fixture.detectChanges();
    
    // @ts-ignore: Jasmine typing issue
    expect(component.unreadCount).toBe(5);
    // @ts-ignore: Jasmine typing issue
    expect(notificationService.fetchNotifications).toHaveBeenCalled();
  });

  it('should toggle dropdown when bell icon is clicked', () => {
    fixture.detectChanges();
    
    // Mock event
    const mockEvent = new MouseEvent('click');
    spyOn(mockEvent, 'stopPropagation');
    
    // Toggle to open
    component.toggleDropdown(mockEvent);
    
    // @ts-ignore: Jasmine typing issue
    expect(mockEvent.stopPropagation).toHaveBeenCalled();
    // @ts-ignore: Jasmine typing issue
    expect(overlay.create).toHaveBeenCalled();
    // @ts-ignore: Jasmine typing issue
    expect(notificationService.fetchNotifications).toHaveBeenCalled();
    
    // Toggle to close
    component.toggleDropdown(mockEvent);
    
    // @ts-ignore: Private property access for testing
    // @ts-ignore: Jasmine typing issue
    expect(component['overlayRef']).toBeNull();
  });

  it('should close dropdown when navigating', () => {
    fixture.detectChanges();
    
    // Set up spy for router
    spyOn(component['router'], 'navigate');
    
    // Open dropdown first
    const mockEvent = new MouseEvent('click');
    component.toggleDropdown(mockEvent);
    
    // Navigate
    component.navigateToAllNotifications();
    
    // @ts-ignore: Jasmine typing issue
    expect(component['router'].navigate).toHaveBeenCalledWith(['/dashboard'], { fragment: 'pantry' });
    // @ts-ignore: Private property access for testing
    // @ts-ignore: Jasmine typing issue
    expect(component['overlayRef']).toBeNull();
  });

  it('should clean up on destroy', () => {
    fixture.detectChanges();
    
    // Open dropdown
    const mockEvent = new MouseEvent('click');
    component.toggleDropdown(mockEvent);
    
    // Destroy component
    component.ngOnDestroy();
    
    // @ts-ignore: Private property access for testing
    // @ts-ignore: Jasmine typing issue
    expect(component['overlayRef']).toBeNull();
  });
}); 