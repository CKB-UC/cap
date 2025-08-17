// Notifications System
// This file handles all notification-related functionality

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    const firebaseConfig = {
        apiKey: "AIzaSyC3KWRTGbH7C-e2Que6IW9VS3Xdl_Hsy7E",
        authDomain: "ratbow-454f1.firebaseapp.com",
        projectId: "ratbow-454f1",
        storageBucket: "ratbow-454f1.firebasestorage.app",
        messagingSenderId: "494138400120",
        appId: "1:494138400120:web:d8eac6dc7437431b783c8d",
        measurementId: "G-71PNRPMEKP"
    };
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Function to log admin activity
function logAdminActivity(type, details) {
    const user = auth.currentUser;
    if (!user) return Promise.reject(new Error("No user logged in"));
    
    return db.collection('activity').add({
        type: type,
        user: user.email,
        details: details,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userId: user.uid
    });
}

// Notification types
const NOTIFICATION_TYPES = {
    ANNOUNCEMENT: 'announcement',
    WORKSHOP_UPDATE: 'workshop_update',
    WORKSHOP_CANCELLED: 'workshop_cancelled',
    WORKSHOP_REMINDER: 'workshop_reminder',
    SYSTEM: 'system'
};

// Notification priorities
const NOTIFICATION_PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

// Create a new notification
async function createNotification(notificationData) {
    try {
        const {
            title,
            message,
            type = NOTIFICATION_TYPES.ANNOUNCEMENT,
            priority = NOTIFICATION_PRIORITIES.MEDIUM,
            targetUsers = 'all', // 'all', 'registered', or array of user IDs
            workshopId = null,
            expiresAt = null
        } = notificationData;

        const notification = {
            title,
            message,
            type,
            priority,
            targetUsers,
            workshopId,
            expiresAt: expiresAt ? new Date(expiresAt) : null,
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            createdBy: auth.currentUser ? auth.currentUser.uid : 'system',
            readBy: [],
            isActive: true
        };

        const docRef = await db.collection('notifications').add(notification);
        
        // Log admin activity
        if (auth.currentUser) {
            await logAdminActivity('Notification Created', `Created notification: ${title}`);
        }

        return docRef.id;
    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
}

// Get notifications for a specific user
async function getUserNotifications(userId, limit = 20) {
    try {
        let query = db.collection('notifications')
            .where('isActive', '==', true)
            .orderBy('createdAt', 'desc')
            .limit(limit);

        const snapshot = await query.get();
        const notifications = [];

        snapshot.forEach(doc => {
            const notification = doc.data();
            notification.id = doc.id;
            
            // Check if notification is targeted to this user
            if (shouldShowNotificationToUser(notification, userId)) {
                notifications.push(notification);
            }
        });

        return notifications;
    } catch (error) {
        console.error('Error getting user notifications:', error);
        throw error;
    }
}

// Check if notification should be shown to user
function shouldShowNotificationToUser(notification, userId) {
    if (notification.targetUsers === 'all') {
        return true;
    }
    
    if (notification.targetUsers === 'registered') {
        // This would need to be checked against user registration status
        return true;
    }
    
    if (Array.isArray(notification.targetUsers)) {
        return notification.targetUsers.includes(userId);
    }
    
    return false;
}

// Mark notification as read
async function markNotificationAsRead(notificationId, userId) {
    try {
        await db.collection('notifications').doc(notificationId).update({
            readBy: firebase.firestore.FieldValue.arrayUnion(userId)
        });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        throw error;
    }
}

// Mark all notifications as read for a user
async function markAllNotificationsAsRead(userId) {
    try {
        const notifications = await getUserNotifications(userId, 100);
        const batch = db.batch();
        
        notifications.forEach(notification => {
            if (!notification.readBy || !notification.readBy.includes(userId)) {
                const notificationRef = db.collection('notifications').doc(notification.id);
                batch.update(notificationRef, {
                    readBy: firebase.firestore.FieldValue.arrayUnion(userId)
                });
            }
        });
        
        await batch.commit();
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
    }
}

// Get unread notification count for a user
async function getUnreadNotificationCount(userId) {
    try {
        const notifications = await getUserNotifications(userId, 100);
        return notifications.filter(notification => 
            !notification.readBy || !notification.readBy.includes(userId)
        ).length;
    } catch (error) {
        console.error('Error getting unread notification count:', error);
        return 0;
    }
}

// Delete a notification (admin only)
async function deleteNotification(notificationId) {
    try {
        await db.collection('notifications').doc(notificationId).delete();
        
        // Log admin activity
        if (auth.currentUser) {
            await logAdminActivity('Notification Deleted', `Deleted notification: ${notificationId}`);
        }
    } catch (error) {
        console.error('Error deleting notification:', error);
        throw error;
    }
}

// Update notification (admin only)
async function updateNotification(notificationId, updateData) {
    try {
        await db.collection('notifications').doc(notificationId).update({
            ...updateData,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Log admin activity
        if (auth.currentUser) {
            await logAdminActivity('Notification Updated', `Updated notification: ${notificationId}`);
        }
    } catch (error) {
        console.error('Error updating notification:', error);
        throw error;
    }
}

// Send workshop-specific notification
async function sendWorkshopNotification(workshopId, title, message, type = NOTIFICATION_TYPES.WORKSHOP_UPDATE) {
    try {
        // Get workshop details
        const workshopDoc = await db.collection('workshops').doc(workshopId).get();
        if (!workshopDoc.exists) {
            throw new Error('Workshop not found');
        }
        
        const workshop = workshopDoc.data();
        const registeredUsers = workshop.registeredUsers || [];
        
        // Create notification for registered users
        const notificationData = {
            title,
            message,
            type,
            priority: NOTIFICATION_PRIORITIES.MEDIUM,
            targetUsers: registeredUsers,
            workshopId,
            expiresAt: workshop.date ? new Date(workshop.date.toDate().getTime() + 7 * 24 * 60 * 60 * 1000) : null // Expire 7 days after workshop
        };
        
        return await createNotification(notificationData);
    } catch (error) {
        console.error('Error sending workshop notification:', error);
        throw error;
    }
}

// Real-time notification listener
function setupNotificationListener(userId, callback) {
    return db.collection('notifications')
        .where('isActive', '==', true)
        .orderBy('createdAt', 'desc')
        .limit(20)
        .onSnapshot((snapshot) => {
            const notifications = [];
            snapshot.forEach(doc => {
                const notification = doc.data();
                notification.id = doc.id;
                
                if (shouldShowNotificationToUser(notification, userId)) {
                    notifications.push(notification);
                }
            });
            
            if (callback) {
                callback(notifications);
            }
        }, (error) => {
            console.error('Error in notification listener:', error);
        });
}

// Display notification badge
function updateNotificationBadge(count) {
    const badge = document.getElementById('notification-badge');
    if (badge) {
        if (count > 0) {
            badge.textContent = count > 99 ? '99+' : count;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Show notification toast
function showNotificationToast(notification) {
    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.innerHTML = `
        <div class="notification-toast-content">
            <div class="notification-toast-header">
                <h4>${notification.title}</h4>
                <button class="notification-toast-close">&times;</button>
            </div>
            <p>${notification.message}</p>
            <div class="notification-toast-time">
                ${new Date(notification.createdAt?.toDate() || new Date()).toLocaleString()}
            </div>
        </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
    
    // Close button
    toast.querySelector('.notification-toast-close').addEventListener('click', () => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    });
}

// Initialize notification system for a page
function initializeNotificationSystem() {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    
    // Setup real-time listener
    const unsubscribe = setupNotificationListener(currentUser.uid, (notifications) => {
        // Update notification count
        const unreadCount = notifications.filter(n => 
            !n.readBy || !n.readBy.includes(currentUser.uid)
        ).length;
        
        updateNotificationBadge(unreadCount);
        
        // Show toast for new notifications
        notifications.forEach(notification => {
            if (!notification.readBy || !notification.readBy.includes(currentUser.uid)) {
                showNotificationToast(notification);
            }
        });
    });
    
    // Return unsubscribe function
    return unsubscribe;
}

// Export functions for use in other files
window.NotificationSystem = {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    getUnreadNotificationCount,
    deleteNotification,
    updateNotification,
    sendWorkshopNotification,
    setupNotificationListener,
    initializeNotificationSystem,
    NOTIFICATION_TYPES,
    NOTIFICATION_PRIORITIES
};
