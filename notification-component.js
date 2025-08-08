// Notification Component
// This file provides a reusable notification component for user pages

class NotificationComponent {
    constructor(containerId, options = {}) {
        this.containerId = containerId;
        this.options = {
            showBadge: true,
            showDropdown: true,
            showToast: true,
            ...options
        };
        
        this.notifications = [];
        this.unreadCount = 0;
        this.isDropdownOpen = false;
        this.unsubscribe = null;
        this.initialized = false;
        
        this.init();
    }
    
    async init() {
        try {
            // Wait for Firebase to be available
            if (typeof firebase === 'undefined') {
                console.error('Firebase not loaded');
                this.showErrorMessage('Firebase not loaded. Please refresh the page.');
                return;
            }
            
            // Wait for Firebase to be initialized
            let attempts = 0;
            while (!firebase.apps.length && attempts < 20) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
            
            if (!firebase.apps.length) {
                console.error('Firebase not initialized');
                this.showErrorMessage('Firebase not initialized. Please refresh the page.');
                return;
            }
            
            // Wait for auth to be ready
            await new Promise((resolve) => {
                const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
                    unsubscribe();
                    resolve(user);
                });
            });
            
            const currentUser = firebase.auth().currentUser;
            if (!currentUser) {
                console.log('No user logged in');
                return;
            }
            
            this.userId = currentUser.uid;
            console.log('Notification component initialized for user:', this.userId);
            
            // Check if container is available and not hidden
            const container = document.getElementById(this.containerId);
            if (!container) {
                console.error(`Container with id '${this.containerId}' not found`);
                return;
            }
            
            if (container.classList.contains('hidden')) {
                console.log('Notification container is hidden, skipping initialization');
                return;
            }
            
            console.log('Creating notification icon for user:', this.userId);
            this.createNotificationIcon();
            this.setupNotificationListener();
            this.initialized = true;
            console.log('Notification component fully initialized');
        } catch (error) {
            console.error('Error initializing notification component:', error);
            this.showErrorMessage('Unable to initialize notifications. Please refresh the page.');
        }
    }
    
    createNotificationIcon() {
        const container = document.getElementById(this.containerId);
        if (!container) {
            console.error(`Container with id '${this.containerId}' not found`);
            return;
        }
        
        // Check if container is hidden
        if (container.classList.contains('hidden')) {
            console.log('Notification container is hidden, skipping initialization');
            return;
        }
        
        // Clear existing content
        container.innerHTML = '';
        
        // Create notification icon
        const notificationIcon = document.createElement('div');
        notificationIcon.className = 'notification-icon relative';
        notificationIcon.innerHTML = `
            <i class="fas fa-bell text-xl text-white"></i>
            <div id="notification-badge" class="notification-badge">0</div>
        `;
        
        // Create dropdown
        const dropdown = document.createElement('div');
        dropdown.className = 'notification-dropdown';
        dropdown.innerHTML = `
            <div class="notification-header">
                <h3>Notifications</h3>
                <button class="mark-all-read" onclick="window.notificationComponent.markAllAsRead()">
                    Mark all as read
                </button>
            </div>
            <div class="notification-list" id="notification-list">
                <div class="notification-empty">
                    <i class="fas fa-bell-slash"></i>
                    <p>No notifications yet</p>
                </div>
            </div>
        `;
        
        notificationIcon.appendChild(dropdown);
        container.appendChild(notificationIcon);
        
        // Add click event
        notificationIcon.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleDropdown();
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!notificationIcon.contains(e.target)) {
                this.closeDropdown();
            }
        });
        
        this.notificationIcon = notificationIcon;
        this.dropdown = dropdown;
        
        console.log('Notification icon created successfully for user:', this.userId);
    }
    
    setupNotificationListener() {
        if (!this.userId) {
            console.log('No user ID available for notification listener');
            return;
        }
        
        try {
            console.log('Setting up notification listener for user:', this.userId);
            
            // First, test if we can access the notifications collection
            firebase.firestore()
                .collection('notifications')
                .limit(1)
                .get()
                .then((snapshot) => {
                    console.log('Notifications collection is accessible, setting up listener');
                    this.setupRealTimeListener();
                })
                .catch((error) => {
                    console.error('Cannot access notifications collection:', error);
                    // Instead of showing an error, just show "No notifications" message
                    this.notifications = [];
                    this.updateNotificationDisplay();
                    this.updateBadge();
                    console.log('Showing empty notifications state due to access issues');
                });
        } catch (error) {
            console.error('Error setting up notification listener:', error);
            this.showErrorMessage('Unable to load notifications. Please try refreshing the page.');
        }
    }
    
    setupRealTimeListener() {
        const startListener = (mode = 'ordered') => {
            try {
                if (this.unsubscribe) {
                    this.unsubscribe();
                    this.unsubscribe = null;
                }
                const base = firebase.firestore().collection('notifications');
                const query = mode === 'ordered'
                    ? base.orderBy('createdAt', 'desc').limit(50)
                    : base.where('isActive', '==', true).limit(50);

                this.unsubscribe = query.onSnapshot((snapshot) => {
                    try {
                        const collected = [];
                        snapshot.forEach(doc => {
                            const notification = doc.data();
                            notification.id = doc.id;
                            if (notification.isActive && this.shouldShowNotificationToUser(notification)) {
                                collected.push(notification);
                            }
                        });

                        // If we used the basic mode, sort client-side to show most recent first
                        this.notifications = mode === 'ordered'
                            ? collected
                            : collected.sort((a, b) => {
                                const aTime = a.createdAt?.toDate?.() || a.createdAt || 0;
                                const bTime = b.createdAt?.toDate?.() || b.createdAt || 0;
                                return bTime - aTime;
                            });

                        console.log(`Found ${this.notifications.length} notifications for user (mode: ${mode}):`, this.userId);
                        this.updateNotificationDisplay();
                        this.updateBadge();
                        if (this.options.showToast) {
                            this.showNewNotificationToasts();
                        }
                    } catch (error) {
                        console.error('Error processing notifications:', error);
                        this.updateNotificationDisplay();
                    }
                }, (error) => {
                    console.error(`Error in notification listener (mode: ${mode}):`, error);
                    // Fallback once if ordered mode fails due to index or rules
                    if (mode === 'ordered' && (error.code === 'failed-precondition' || error.code === 'permission-denied')) {
                        console.log('Falling back to basic notification query');
                        startListener('basic');
                        return;
                    }

                    let errorMessage = 'Unable to load notifications. Please try refreshing the page.';
                    if (error.code === 'permission-denied') {
                        errorMessage = 'You do not have permission to view notifications. Please contact an administrator.';
                    } else if (error.code === 'unavailable') {
                        errorMessage = 'Service temporarily unavailable. Please try again later.';
                    } else if (error.code === 'unauthenticated') {
                        errorMessage = 'Please log in to view notifications.';
                    } else if (error.code === 'failed-precondition') {
                        errorMessage = 'Unable to load notifications. Please try again.';
                    } else if (error.code === 'not-found') {
                        errorMessage = 'Notifications collection not found.';
                    }
                    this.showErrorMessage(errorMessage);
                });
            } catch (error) {
                console.error('Error setting up real-time listener:', error);
                this.showErrorMessage('Unable to load notifications. Please try refreshing the page.');
            }
        };

        // Start with ordered mode for recency correctness
        startListener('ordered');
    }
    
    shouldShowNotificationToUser(notification) {
        if (notification.targetUsers === 'all') {
            return true;
        }
        
        if (notification.targetUsers === 'registered') {
            // This would need to be checked against user registration status
            return true;
        }
        
        if (Array.isArray(notification.targetUsers)) {
            return notification.targetUsers.includes(this.userId);
        }
        
        return false;
    }
    
    updateNotificationDisplay() {
        try {
            const notificationList = document.getElementById('notification-list');
            if (!notificationList) {
                console.log('Notification list element not found');
                return;
            }
            
            if (this.notifications.length === 0) {
                notificationList.innerHTML = `
                    <div class="notification-empty">
                        <i class="fas fa-bell-slash"></i>
                        <p>No notifications yet</p>
                    </div>
                `;
                return;
            }
            
            notificationList.innerHTML = '';
            
            this.notifications.forEach(notification => {
                try {
                    const isUnread = !notification.readBy || !notification.readBy.includes(this.userId);
                    const notificationElement = this.createNotificationElement(notification, isUnread);
                    notificationList.appendChild(notificationElement);
                } catch (error) {
                    console.error('Error creating notification element:', error);
                }
            });
        } catch (error) {
            console.error('Error updating notification display:', error);
            this.showErrorMessage('Unable to display notifications. Please refresh the page.');
        }
    }
    
    createNotificationElement(notification, isUnread) {
        const div = document.createElement('div');
        div.className = `notification-item ${isUnread ? 'unread' : ''}`;
        
        const createdAt = notification.createdAt?.toDate() || new Date();
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'medium',
            timeStyle: 'short'
        }).format(createdAt);
        
        div.innerHTML = `
            <div class="notification-content" onclick="window.notificationComponent.toggleNotificationExpansion(this)">
                <div class="notification-header-row">
                    <h4>${notification.title}</h4>
                    <span class="notification-time">${formattedDate}</span>
                </div>
                <p class="notification-message">${notification.message}</p>
                <div class="notification-meta">
                    <span class="notification-type ${notification.type}">${notification.type}</span>
                    <button class="notification-reply-btn" onclick="window.notificationComponent.showReplyForm('${notification.id}', '${notification.title}')">
                        <i class="fas fa-reply"></i> Reply
                    </button>
                </div>
                <div class="notification-expanded-content" style="display: none;">
                    <div class="notification-details">
                        <p><strong>From:</strong> Admin</p>
                        <p><strong>Type:</strong> ${notification.type}</p>
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        ${notification.description ? `<p><strong>Description:</strong> ${notification.description}</p>` : ''}
                        ${notification.link ? `<p><strong>Link:</strong> <a href="${notification.link}" target="_blank">${notification.link}</a></p>` : ''}
                    </div>
                    <div class="notification-replies" id="replies-${notification.id}">
                        <h5>Replies</h5>
                        <div class="replies-list">
                            <!-- Replies will be loaded here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Load replies for this notification
        this.loadReplies(notification.id);
        
        return div;
    }
    
    updateBadge() {
        const badge = document.getElementById('notification-badge');
        if (!badge) return;
        
        this.unreadCount = this.notifications.filter(notification => 
            !notification.readBy || !notification.readBy.includes(this.userId)
        ).length;
        
        if (this.unreadCount > 0) {
            badge.textContent = this.unreadCount > 99 ? '99+' : this.unreadCount;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }
    
    async markAsRead(notificationId) {
        if (!this.userId) return;
        
        try {
            await firebase.firestore()
                .collection('notifications')
                .doc(notificationId)
                .update({
                    readBy: firebase.firestore.FieldValue.arrayUnion(this.userId)
                });
        } catch (error) {
            console.error('Error marking notification as read:', error);
        }
    }
    
    async markAllAsRead() {
        if (!this.userId) return;
        
        try {
            const batch = firebase.firestore().batch();
            
            this.notifications.forEach(notification => {
                if (!notification.readBy || !notification.readBy.includes(this.userId)) {
                    const notificationRef = firebase.firestore()
                        .collection('notifications')
                        .doc(notification.id);
                    batch.update(notificationRef, {
                        readBy: firebase.firestore.FieldValue.arrayUnion(this.userId)
                    });
                }
            });
            
            await batch.commit();
        } catch (error) {
            console.error('Error marking all notifications as read:', error);
        }
    }
    
    toggleDropdown() {
        if (this.isDropdownOpen) {
            this.closeDropdown();
        } else {
            this.openDropdown();
        }
    }
    
    openDropdown() {
        if (this.dropdown) {
            this.dropdown.classList.add('show');
            this.isDropdownOpen = true;
        }
    }
    
    closeDropdown() {
        if (this.dropdown) {
            this.dropdown.classList.remove('show');
            this.isDropdownOpen = false;
        }
    }
    
    showNewNotificationToasts() {
        // Show toast for new unread notifications
        this.notifications.forEach(notification => {
            if (!notification.readBy || !notification.readBy.includes(this.userId)) {
                // Check if this is a new notification (created in the last 30 seconds)
                const createdAt = notification.createdAt?.toDate() || new Date();
                const now = new Date();
                const timeDiff = (now - createdAt) / 1000; // in seconds
                
                if (timeDiff < 30) {
                    this.showNotificationToast(notification);
                }
            }
        });
    }
    
    showNotificationToast(notification) {
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
    
    showErrorMessage(message) {
        const notificationList = document.getElementById('notification-list');
        if (notificationList) {
            notificationList.innerHTML = `
                <div class="notification-error">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>${message}</p>
                    <button onclick="window.notificationComponent.retry()" class="mt-2 bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition">
                        Retry
                    </button>
                </div>
            `;
        } else {
            // If notification list is not available, try to create it
            const container = document.getElementById(this.containerId);
            if (container && !container.classList.contains('hidden')) {
                this.createNotificationIcon();
                this.showErrorMessage(message);
            }
        }
    }
    
    retry() {
        if (this.userId) {
            // Clean up existing listener
            if (this.unsubscribe) {
                this.unsubscribe();
                this.unsubscribe = null;
            }
            this.setupNotificationListener();
        } else {
            this.init();
        }
    }
    
    destroy() {
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        
        if (this.notificationIcon && this.notificationIcon.parentNode) {
            this.notificationIcon.parentNode.removeChild(this.notificationIcon);
        }
        
        // Clear the container
        const container = document.getElementById(this.containerId);
        if (container) {
            container.innerHTML = '';
        }
        
        this.initialized = false;
        this.notifications = [];
        this.unreadCount = 0;
        this.isDropdownOpen = false;
    }

    toggleNotificationExpansion(element) {
        const expandedContent = element.querySelector('.notification-expanded-content');
        const notificationItem = element.closest('.notification-item');
        
        if (expandedContent.style.display === 'none') {
            expandedContent.style.display = 'block';
            notificationItem.classList.add('expanded');
            // Mark as read when expanded
            const notificationId = this.getNotificationIdFromElement(element);
            if (notificationId) {
                this.markAsRead(notificationId);
            }
        } else {
            expandedContent.style.display = 'none';
            notificationItem.classList.remove('expanded');
        }
    }
    
    getNotificationIdFromElement(element) {
        // Find the notification ID from the reply button or other element
        const replyBtn = element.querySelector('.notification-reply-btn');
        if (replyBtn) {
            const onclick = replyBtn.getAttribute('onclick');
            const match = onclick.match(/showReplyForm\('([^']+)'/);
            return match ? match[1] : null;
        }
        return null;
    }
    
    showReplyForm(notificationId, notificationTitle) {
        // Create modal for reply
        const modal = document.createElement('div');
        modal.className = 'reply-modal';
        modal.innerHTML = `
            <div class="reply-modal-content">
                <div class="reply-modal-header">
                    <h3>Reply to: ${notificationTitle}</h3>
                    <button class="reply-modal-close" onclick="this.closest('.reply-modal').remove()">&times;</button>
                </div>
                <div class="reply-modal-body">
                    <textarea id="reply-message" placeholder="Type your reply here..." rows="4"></textarea>
                    <div class="reply-modal-actions">
                        <button class="reply-send-btn" onclick="window.notificationComponent.sendReply('${notificationId}')">
                            <i class="fas fa-paper-plane"></i> Send Reply
                        </button>
                        <button class="reply-cancel-btn" onclick="this.closest('.reply-modal').remove()">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Focus on textarea
        setTimeout(() => {
            const textarea = modal.querySelector('#reply-message');
            textarea.focus();
        }, 100);
    }
    
    async sendReply(notificationId) {
        const textarea = document.querySelector('#reply-message');
        const message = textarea.value.trim();
        
        if (!message) {
            alert('Please enter a reply message.');
            return;
        }
        
        if (!this.userId) {
            alert('You must be logged in to send a reply.');
            return;
        }
        
        try {
            const replyData = {
                notificationId: notificationId,
                userId: this.userId,
                message: message,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                userName: firebase.auth().currentUser.displayName || firebase.auth().currentUser.email || 'Anonymous'
            };
            
            await firebase.firestore()
                .collection('notificationReplies')
                .add(replyData);
            
            // Close modal
            document.querySelector('.reply-modal').remove();
            
            // Reload replies for this notification
            this.loadReplies(notificationId);
            
            // Show success message
            this.showToast('Reply sent successfully!', 'success');
            
        } catch (error) {
            console.error('Error sending reply:', error);
            alert('Failed to send reply. Please try again.');
        }
    }
    
    async loadReplies(notificationId) {
        try {
            const repliesSnapshot = await firebase.firestore()
                .collection('notificationReplies')
                .where('notificationId', '==', notificationId)
                .orderBy('createdAt', 'asc')
                .get();
            
            const repliesList = document.querySelector(`#replies-${notificationId} .replies-list`);
            if (!repliesList) return;
            
            repliesList.innerHTML = '';
            
            if (repliesSnapshot.empty) {
                repliesList.innerHTML = '<p class="no-replies">No replies yet</p>';
                return;
            }
            
            repliesSnapshot.forEach(doc => {
                const reply = doc.data();
                const replyElement = this.createReplyElement(reply);
                repliesList.appendChild(replyElement);
            });
            
        } catch (error) {
            console.error('Error loading replies:', error);
            const repliesList = document.querySelector(`#replies-${notificationId} .replies-list`);
            if (repliesList) {
                repliesList.innerHTML = '<p class="error">Failed to load replies</p>';
            }
        }
    }
    
    createReplyElement(reply) {
        const div = document.createElement('div');
        div.className = 'reply-item';
        
        const createdAt = reply.createdAt?.toDate() || new Date();
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'short',
            timeStyle: 'short'
        }).format(createdAt);
        
        div.innerHTML = `
            <div class="reply-content">
                <div class="reply-header">
                    <span class="reply-author">${reply.userName}</span>
                    <span class="reply-time">${formattedDate}</span>
                </div>
                <p class="reply-message">${reply.message}</p>
            </div>
        `;
        
        return div;
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `notification-toast ${type}`;
        toast.innerHTML = `
            <div class="notification-toast-content">
                <p>${message}</p>
                <button class="notification-toast-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 3000);
        
        // Close button
        toast.querySelector('.notification-toast-close').addEventListener('click', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }
}

// Global instance for easy access
window.notificationComponent = null;

// Initialize notification component when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    if (typeof firebase !== 'undefined' && firebase.auth().currentUser) {
        // Look for notification container
        const container = document.getElementById('notification-container');
        if (container) {
            window.notificationComponent = new NotificationComponent('notification-container');
        }
    }
});

// Export for use in other files
window.NotificationComponent = NotificationComponent;

