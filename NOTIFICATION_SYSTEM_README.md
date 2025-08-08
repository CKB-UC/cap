# Notification System Documentation

## Overview

The notification system allows admins to send announcements and updates to registered users, and enables users to receive real-time notifications about workshops, announcements, and system updates.

## Features

### For Admins
- **Create Notifications**: Send announcements, workshop updates, reminders, and system notifications
- **Target Specific Users**: Send notifications to all users, registered users only, or specific users
- **Manage Notifications**: Edit, delete, and view all notifications
- **Workshop Integration**: Automatically send notifications when workshops are created or updated
- **Priority Levels**: Set notification priority (low, medium, high, urgent)

### For Users
- **Real-time Notifications**: Receive instant notifications via toast messages
- **Notification Badge**: See unread notification count in the navigation
- **Notification Dropdown**: View and manage notifications from the navigation
- **Dedicated Page**: Full notifications page with filtering and management
- **Mark as Read**: Mark individual notifications or all notifications as read

## File Structure

```
├── notifications.js                 # Core notification system functionality
├── notification-component.js        # Reusable notification component
├── manage-workshops-notifications.html     # Combined admin page for Workshop & Notification management
├── notifications.html              # User notifications page
├── css/
│   └── notifications.css           # Notification system styles
└── NOTIFICATION_SYSTEM_README.md   # This documentation
```

## Usage

### For Admins

1. **Access Notification Management**:
   - Go to Admin Dashboard
   - Click "Notification Management"
   - Or navigate directly to `manage-workshops-notifications.html`

2. **Create a Notification**:
   - Fill out the notification form
   - Select notification type (announcement, workshop_update, etc.)
   - Choose target users (all, registered, or specific)
   - Set priority level
   - Add expiration date (optional)
   - Click "Send Notification"

3. **Manage Notifications**:
   - View all notifications in the list
   - Filter by notification type
   - Edit or delete notifications
   - Refresh to see latest notifications

### For Users

1. **View Notifications**:
   - Click the bell icon in the navigation to see notifications dropdown
   - Or navigate to `notifications.html` for full notifications page

2. **Manage Notifications**:
   - Click on a notification to mark it as read
   - Use "Mark All as Read" to mark all notifications as read
   - Filter notifications by type
   - Refresh to see latest notifications

## Notification Types

- **announcement**: General announcements from admin
- **workshop_update**: Updates about existing workshops
- **workshop_cancelled**: Workshop cancellation notices
- **workshop_reminder**: Reminders about upcoming workshops
- **system**: System-related notifications

## Priority Levels

- **low**: Low priority notifications (green indicator)
- **medium**: Medium priority notifications (yellow indicator)
- **high**: High priority notifications (orange indicator)
- **urgent**: Urgent notifications (red indicator)

## Integration

### Adding to New Pages

1. **Include Required Scripts**:
   ```html
   <script src="notifications.js"></script>
   <script src="notification-component.js"></script>
   <link rel="stylesheet" href="css/notifications.css">
   ```

2. **Add Notification Container**:
   ```html
   <div id="notification-container"></div>
   ```

3. **Initialize Component**:
   ```javascript
   // In your page's JavaScript
   if (document.getElementById('notification-container')) {
       window.notificationComponent = new NotificationComponent('notification-container');
   }
   ```

### Automatic Notifications

The system automatically sends notifications for:
- New workshop creation
- Workshop updates (to registered users)
- Workshop cancellations
- System maintenance

## Database Structure

### Notifications Collection

```javascript
{
  title: "Notification Title",
  message: "Notification message content",
  type: "announcement|workshop_update|workshop_cancelled|workshop_reminder|system",
  priority: "low|medium|high|urgent",
  targetUsers: "all|registered|[userIds]",
  workshopId: "optional-workshop-id",
  expiresAt: "optional-expiration-date",
  createdAt: "timestamp",
  createdBy: "admin-user-id",
  readBy: ["user-ids-who-read"],
  isActive: true
}
```

## API Reference

### NotificationSystem Object

```javascript
// Create a new notification
await NotificationSystem.createNotification({
  title: "Title",
  message: "Message",
  type: "announcement",
  priority: "medium",
  targetUsers: "all"
});

// Get user notifications
const notifications = await NotificationSystem.getUserNotifications(userId);

// Mark notification as read
await NotificationSystem.markNotificationAsRead(notificationId, userId);

// Mark all notifications as read
await NotificationSystem.markAllNotificationsAsRead(userId);

// Send workshop-specific notification
await NotificationSystem.sendWorkshopNotification(workshopId, title, message, type);
```

### NotificationComponent Class

```javascript
// Initialize component
const notificationComponent = new NotificationComponent('container-id', {
  showBadge: true,
  showDropdown: true,
  showToast: true
});

// Destroy component
notificationComponent.destroy();
```

## Styling

The notification system uses CSS classes for styling:

- `.notification-badge`: Badge showing unread count
- `.notification-dropdown`: Dropdown container
- `.notification-item`: Individual notification item
- `.notification-toast`: Toast notification
- `.notification-type`: Notification type badge
- `.notification-priority`: Priority indicator

## Browser Support

- Modern browsers with ES6 support
- Firebase compatibility
- Real-time updates via Firestore listeners

## Security

- Only admins can create, edit, and delete notifications
- Users can only view notifications targeted to them
- Authentication required for all notification operations
- Proper error handling and validation

## Troubleshooting

### Common Issues

1. **Notifications not showing**:
   - Check if user is authenticated
   - Verify notification target users
   - Check browser console for errors

2. **Real-time updates not working**:
   - Verify Firebase connection
   - Check Firestore rules
   - Ensure proper listener setup

3. **Styling issues**:
   - Verify CSS file is loaded
   - Check for CSS conflicts
   - Ensure proper class names

### Debug Mode

Enable debug logging by adding to console:
```javascript
localStorage.setItem('notificationDebug', 'true');
```

## Future Enhancements

- Email notifications
- Push notifications
- Notification preferences
- Notification templates
- Bulk notification sending
- Notification analytics
- Mobile app integration
