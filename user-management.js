// User Management JavaScript

// Global variables
let currentUserId = null;
let currentPage = 1;
const usersPerPage = 10;
let lastVisible = null;
let firstVisible = null;
let usersList = [];

// Check if user is logged in and is admin
document.addEventListener('DOMContentLoaded', () => {
    auth.onAuthStateChanged((user) => {
        if (user) {
            db.collection('users').doc(user.uid).get().then((doc) => {
                const userData = doc.data();
                if (!userData || userData.role !== 'admin') {
                    window.location.href = 'index.html';
                } else {
                    // Load users data
                    loadUsers();
                    setupEventListeners();
                }
            }).catch((error) => {
                console.error("Error verifying admin status:", error);
                window.location.href = 'login.html';
            });
        } else {
            window.location.href = 'login.html';
        }
    });
});

// Setup all event listeners
function setupEventListeners() {
    // Search input
    document.getElementById('searchUser').addEventListener('input', debounce(handleSearch, 300));
    
    // Role filter
    document.getElementById('roleFilter').addEventListener('change', handleRoleFilter);
    
    // Add user button
    document.getElementById('addUserBtn').addEventListener('click', () => showUserModal());
    
    // Cancel button in user modal
    document.getElementById('cancelUserBtn').addEventListener('click', hideUserModal);
    
    // User form submission
    document.getElementById('userForm').addEventListener('submit', handleUserFormSubmit);
    
    // Pagination buttons
    document.getElementById('prevPageBtn').addEventListener('click', () => navigatePages('prev'));
    document.getElementById('nextPageBtn').addEventListener('click', () => navigatePages('next'));
    
    // Delete modal buttons
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmDeleteUser);
    document.getElementById('cancelDeleteBtn').addEventListener('click', hideDeleteModal);
}

// Load users data
function loadUsers(searchTerm = '', roleFilter = '') {
    console.log('Loading users with search:', searchTerm, 'and role filter:', roleFilter);
    const usersTable = document.getElementById('usersTable');
    usersTable.innerHTML = '<tr><td colspan="6" class="py-4 px-4 text-center text-gray-500">Loading users...</td></tr>';
    
    let query = db.collection('users');
    
    // Apply role filter if specified
    if (roleFilter) {
        query = query.where('role', '==', roleFilter);
        query = query.orderBy('role').orderBy('name');
    } else {
        query = query.orderBy('name');
    }
    
    // Apply pagination
    query = query.limit(usersPerPage);
    
    if (lastVisible && currentPage > 1) {
        query = query.startAfter(lastVisible);
    }
    
    query.get().then((snapshot) => {
        if (snapshot.empty) {
            usersTable.innerHTML = '<tr><td colspan="6" class="py-4 px-4 text-center text-gray-500">No users found</td></tr>';
            document.getElementById('userCount').textContent = 'Showing 0 users';
            return;
        }
        
        firstVisible = snapshot.docs[0];
        lastVisible = snapshot.docs[snapshot.docs.length - 1];
        
        document.getElementById('prevPageBtn').disabled = currentPage === 1;
        document.getElementById('nextPageBtn').disabled = snapshot.docs.length < usersPerPage;
        
        usersTable.innerHTML = '';
        usersList = [];
        
        snapshot.forEach((doc) => {
            const user = doc.data();
            user.id = doc.id;
            
            if (searchTerm && !(
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase())
            )) {
                return;
            }
            
            usersList.push(user);
            
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-2 px-4 border-b">${user.name || 'N/A'}</td>
                <td class="py-2 px-4 border-b">${user.email || 'N/A'}</td>
                <td class="py-2 px-4 border-b">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}">
                        ${user.role || 'user'}
                    </span>
                </td>
                <td class="py-2 px-4 border-b">${formatDate(user.created?.toDate())}</td>
                <td class="py-2 px-4 border-b">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(user.status)}">
                        ${user.status || 'active'}
                    </span>
                </td>
                <td class="py-2 px-4 border-b">
                    <button onclick="showUserModal('${user.id}')" class="text-indigo-600 hover:text-indigo-900 mr-3">
                        Edit
                    </button>
                    <button onclick="showDeleteModal('${user.id}')" class="text-red-600 hover:text-red-900">
                        Delete
                    </button>
                </td>
            `;
            
            usersTable.appendChild(row);
        });
        
        document.getElementById('userCount').textContent = `Showing ${usersList.length} users`;
        
        if (usersTable.innerHTML === '') {
            usersTable.innerHTML = '<tr><td colspan="6" class="py-4 px-4 text-center text-gray-500">No users matching your search</td></tr>';
        }
    }).catch((error) => {
        console.error("Error getting users: ", error);
        usersTable.innerHTML = `
            <tr>
                <td colspan="6" class="py-4 px-4 text-center text-red-500">
                    Error loading users: ${error.message}
                </td>
            </tr>
        `;
        document.getElementById('userCount').textContent = 'Error loading users';
    });
}

// Format date
function formatDate(date) {
    if (!date) return 'N/A';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Get badge class for role
function getRoleBadgeClass(role) {
    switch(role) {
        case 'admin':
            return 'bg-purple-100 text-purple-800';
        case 'instructor':
            return 'bg-blue-100 text-blue-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Get badge class for status
function getStatusBadgeClass(status) {
    switch(status) {
        case 'active':
            return 'bg-green-100 text-green-800';
        case 'inactive':
            return 'bg-gray-100 text-gray-800';
        case 'suspended':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

// Show user modal
function showUserModal(userId = null) {
    console.log('Showing user modal for:', userId);
    currentUserId = userId;
    const modalTitle = document.getElementById('modalTitle');
    const userForm = document.getElementById('userForm');
    const passwordField = document.getElementById('userPassword');
    const userModal = document.getElementById('userModal');
    
    // Reset form
    userForm.reset();
    
    if (userId) {
        // Edit existing user
        modalTitle.textContent = 'Edit User';
        passwordField.required = false;
        
        // Find user in the list
        const user = usersList.find(u => u.id === userId);
        
        if (user) {
            console.log('Found user in list:', user);
            document.getElementById('userName').value = user.name || '';
            document.getElementById('userEmail').value = user.email || '';
            document.getElementById('userRole').value = user.role || 'user';
            document.getElementById('userStatus').value = user.status || 'active';
            
            // Disable email field since we can't change Firebase Auth email directly
            document.getElementById('userEmail').disabled = true;
        } else {
            console.log('Fetching user from database:', userId);
            // Fetch user data if not in current list
            db.collection('users').doc(userId).get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    document.getElementById('userName').value = userData.name || '';
                    document.getElementById('userEmail').value = userData.email || '';
                    document.getElementById('userRole').value = userData.role || 'user';
                    document.getElementById('userStatus').value = userData.status || 'active';
                    
                    // Disable email field
                    document.getElementById('userEmail').disabled = true;
                } else {
                    console.error("User not found");
                    alert("User not found");
                    hideUserModal();
                }
            }).catch((error) => {
                console.error("Error getting user: ", error);
                alert("Error getting user: " + error.message);
                hideUserModal();
            });
        }
    } else {
        // Add new user
        console.log('Opening modal for new user');
        modalTitle.textContent = 'Add New User';
        passwordField.required = true;
        
        // Enable email field for new users
        document.getElementById('userEmail').disabled = false;
    }
    
    // Show modal
    if (userModal) {
        userModal.style.display = 'flex';
        userModal.classList.remove('hidden');
        console.log('User modal is now visible');
    } else {
        console.error('User modal element not found in the DOM');
    }
}

// Hide user modal
function hideUserModal() {
    console.log('Hiding user modal');
    const userModal = document.getElementById('userModal');
    if (userModal) {
        userModal.style.display = 'none';
        userModal.classList.add('hidden');
        console.log('User modal is now hidden');
    }
    currentUserId = null;
}

// Show delete confirmation modal
function showDeleteModal(userId) {
    console.log('Showing delete modal for user:', userId);
    currentUserId = userId;
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.style.display = 'flex';
        deleteModal.classList.remove('hidden');
        console.log('Delete modal is now visible');
    } else {
        console.error('Delete modal element not found in the DOM');
    }
}

// Hide delete confirmation modal
function hideDeleteModal() {
    console.log('Hiding delete modal');
    const deleteModal = document.getElementById('deleteModal');
    if (deleteModal) {
        deleteModal.style.display = 'none';
        deleteModal.classList.add('hidden');
        console.log('Delete modal is now hidden');
    }
    currentUserId = null;
}

// Handle user form submission
function handleUserFormSubmit(event) {
    event.preventDefault();
    
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;
    const status = document.getElementById('userStatus').value;
    
    if (currentUserId) {
        // Update existing user
        db.collection('users').doc(currentUserId).update({
            name: name,
            role: role,
            status: status,
            updated: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            // Log activity
            logAdminActivity('User Updated', `Updated user: ${name} (${email})`);
            
            alert("User updated successfully");
            hideUserModal();
            loadUsers();
        }).catch((error) => {
            console.error("Error updating user: ", error);
            alert("Error updating user: " + error.message);
        });
    } else {
        // Create new user in Firebase Auth
        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                const firebaseUser = userCredential.user;
                
                // Create user document in Firestore
                return db.collection('users').doc(firebaseUser.uid).set({
                    name: name,
                    email: email,
                    role: role,
                    status: status,
                    created: firebase.firestore.FieldValue.serverTimestamp()
                });
            })
            .then(() => {
                // Log activity
                logAdminActivity('User Created', `Created new user: ${name} (${email})`);
                
                alert("User created successfully");
                hideUserModal();
                loadUsers();
            })
            .catch((error) => {
                console.error("Error creating user: ", error);
                alert("Error creating user: " + error.message);
            });
    }
}

// Confirm delete user
function confirmDeleteUser() {
    console.log('Confirming delete for user:', currentUserId);
    if (!currentUserId) {
        console.error('No user ID found for deletion');
        hideDeleteModal();
        return;
    }
    
    // Get user data for logging
    const user = usersList.find(u => u.id === currentUserId);
    console.log('User to delete:', user);
    
    // Delete user document from Firestore
    db.collection('users').doc(currentUserId).delete()
        .then(() => {
            console.log('User deleted successfully');
            // Log activity
            if (user) {
                logAdminActivity('User Deleted', `Deleted user: ${user.name} (${user.email})`);
            } else {
                logAdminActivity('User Deleted', `Deleted user with ID: ${currentUserId}`);
            }
            
            alert("User deleted successfully");
            hideDeleteModal();
            loadUsers();
        })
        .catch((error) => {
            console.error("Error deleting user: ", error);
            alert("Error deleting user: " + error.message);
        });
}

// Handle search input
function handleSearch() {
    const searchTerm = document.getElementById('searchUser').value;
    const roleFilter = document.getElementById('roleFilter').value;
    
    // Reset pagination
    currentPage = 1;
    firstVisible = null;
    lastVisible = null;
    
    loadUsers(searchTerm, roleFilter);
}

// Handle role filter
function handleRoleFilter() {
    const searchTerm = document.getElementById('searchUser').value;
    const roleFilter = document.getElementById('roleFilter').value;
    
    // Reset pagination
    currentPage = 1;
    firstVisible = null;
    lastVisible = null;
    
    loadUsers(searchTerm, roleFilter);
}

// Navigate between pages
function navigatePages(direction) {
    if (direction === 'prev' && currentPage > 1) {
        currentPage--;
        
        // Query for previous page
        let query = db.collection('users');
        const roleFilter = document.getElementById('roleFilter').value;
        
        if (roleFilter) {
            query = query.where('role', '==', roleFilter);
            query = query.orderBy('role').orderBy('name');
        } else {
            query = query.orderBy('name');
        }
        
        query = query.endBefore(firstVisible)
            .limitToLast(usersPerPage);
        
        query.get().then((snapshot) => {
            if (!snapshot.empty) {
                firstVisible = snapshot.docs[0];
                lastVisible = snapshot.docs[snapshot.docs.length - 1];
                
                // Reload with updated pagination
                const searchTerm = document.getElementById('searchUser').value;
                loadUsers(searchTerm, roleFilter);
            }
        }).catch((error) => {
            console.error("Error navigating pages:", error);
            alert("Error loading previous page: " + error.message);
        });
    } else if (direction === 'next') {
        currentPage++;
        
        // Next page will be loaded using the lastVisible document
        const searchTerm = document.getElementById('searchUser').value;
        const roleFilter = document.getElementById('roleFilter').value;
        loadUsers(searchTerm, roleFilter);
    }
}

// Debounce function for search input
function debounce(func, wait) {
    let timeout;
    return function() {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(context, args);
        }, wait);
    };
}