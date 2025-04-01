import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification, NotificationType } from '../../../models/notification.model';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.css']
})
export class NotificationItemComponent {
  @Input() notification!: Notification;
  @Output() markAsRead = new EventEmitter<string>();
  @Output() delete = new EventEmitter<string>();

  // Make enum accessible in template
  NotificationType = NotificationType;
  
  /**
   * Get CSS class based on notification type
   */
  getTypeClass(): string {
    switch (this.notification.type) {
      case NotificationType.EXPIRED:
        return 'text-red-500';
      case NotificationType.EXPIRING:
        return 'text-yellow-500';
      case NotificationType.LOW_STOCK:
        return 'text-blue-500';
      case NotificationType.OUT_OF_STOCK:
        return 'text-orange-500';
      default:
        return '';
    }
  }

  /**
   * Get icon based on notification type
   */
  getTypeIcon(): string {
    switch (this.notification.type) {
      case NotificationType.EXPIRED:
        return 'exclamation-circle';
      case NotificationType.EXPIRING:
        return 'clock';
      case NotificationType.LOW_STOCK:
        return 'shopping-cart';
      case NotificationType.OUT_OF_STOCK:
        return 'exclamation-triangle';
      default:
        return 'bell';
    }
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  }

  /**
   * Handle mark as read button click
   */
  onMarkAsRead(event: Event): void {
    event.stopPropagation();
    this.markAsRead.emit(this.notification.id);
  }

  /**
   * Handle delete button click
   */
  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.notification.id);
  }
} 