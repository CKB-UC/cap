# UPSKILL Platform

A comprehensive learning management system with workshop management, user verification, and notification systems.

## Features

- **User Management**: Registration, login, and role-based access control
- **Workshop Management**: Create, edit, and manage workshops
- **Notification System**: Send notifications to users and receive replies
- **Contact Management**: Handle contact form submissions and user replies
- **Admin Dashboard**: Comprehensive admin interface

## User Reply System

### How Users Reply to Notifications

1. **Users see notifications** in their notification dropdown
2. **Click "Reply" button** on any notification
3. **Type their reply** in the modal that appears
4. **Submit the reply** - it's automatically saved to the database

### How Admins View User Replies

1. **Go to Contact Management** (`contact-management.html`)
2. **Click "Notification Replies" tab** (top of the page)
3. **View all user replies** with context about which notification they replied to
4. **Real-time updates** - new replies appear automatically

### Features of the Reply System

- **Real-time updates**: New replies appear instantly
- **Context display**: Shows which notification the user replied to
- **User information**: Displays user name and timestamp
- **Admin actions**: View notification details, delete replies
- **Statistics**: Track total replies, today's replies, unique users

### Testing the System

Use the "Test Reply" button in Contact Management to create sample replies and see how they appear in the system.

## File Structure

```
cap/
├── contact-management.html      # Admin interface for viewing user replies
├── notification-component.js    # User notification component with reply functionality
├── notifications.html          # User notifications page
├── contact.html               # Contact form for users
└── css/
    └── notifications.css      # Styles for notification system
```

## Quick Start

1. Start the server: `node server.js`
2. Access the admin dashboard
3. Go to Contact Management
4. Click "Notification Replies" tab to view user replies
