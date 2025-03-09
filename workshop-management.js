// Check if user is admin
document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged((user) => {
        if (user) {
            db.collection('users').doc(user.uid).get().then((doc) => {
                const userData = doc.data();
                if (!userData || userData.role !== 'admin') {
                    window.location.href = 'index.html';
                } else {
                    // Load workshops once admin is authenticated
                    loadWorkshops();
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

// Set up event listeners
function setupEventListeners() {
    // Create workshop button
    document.getElementById('createWorkshopBtn').addEventListener('click', () => {
        openWorkshopModal();
    });
    
    // Close modal buttons
    document.getElementById('closeModal').addEventListener('click', closeWorkshopModal);
    document.getElementById('cancelBtn').addEventListener('click', closeWorkshopModal);
    
    // Workshop form submission
    document.getElementById('workshopForm').addEventListener('submit', handleWorkshopSubmit);
    
    // Status filter
    document.getElementById('statusFilter').addEventListener('change', loadWorkshops);
    
    // Search workshops
    document.getElementById('searchWorkshops').addEventListener('input', loadWorkshops);
    
    // Confirmation modal
    document.getElementById('cancelConfirmation').addEventListener('click', closeConfirmationModal);
}

// Load workshops from Firestore
function loadWorkshops() {
    const workshopsList = document.getElementById('workshopsList');
    workshopsList.innerHTML = '<tr><td colspan="6" class="py-4 px-4 text-center text-gray-500">Loading workshops...</td></tr>';
    
    // Get status filter value
    const statusFilter = document.getElementById('statusFilter').value;
    // Get search input value
    const searchTerm = document.getElementById('searchWorkshops').value.toLowerCase();
    
    // Create the query
    let query = db.collection('workshops');
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
        query = query.where('status', '==', statusFilter);
    }
    
    // Order by date
    query = query.orderBy('date', 'desc');
    
    // Execute the query
    query.get().then((snapshot) => {
        // Clear loading message
        workshopsList.innerHTML = '';
        
        if (snapshot.empty) {
            workshopsList.innerHTML = '<tr><td colspan="6" class="py-4 px-4 text-center text-gray-500">No workshops found</td></tr>';
            return;
        }
        
        // Process each workshop
        snapshot.forEach((doc) => {
            const workshop = doc.data();
            workshop.id = doc.id;
            
            // Apply search filter if there's a search term
            if (searchTerm && !workshop.title.toLowerCase().includes(searchTerm) && 
                !workshop.description?.toLowerCase().includes(searchTerm)) {
                return; // Skip this workshop if it doesn't match search
            }
            
            // Format the date
            const date = workshop.date?.toDate() || new Date();
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Create status badge class based on status
            let statusClass = '';
            switch(workshop.status) {
                case 'active':
                    statusClass = 'bg-green-100 text-green-800';
                    break;
                case 'upcoming':
                    statusClass = 'bg-blue-100 text-blue-800';
                    break;
                case 'completed':
                    statusClass = 'bg-gray-100 text-gray-800';
                    break;
                default:
                    statusClass = 'bg-gray-100 text-gray-800';
            }
            
            // Create table row
            const row = document.createElement('tr');
            row.className = 'hover:bg-gray-50';
            row.innerHTML = `
                <td class="py-3 px-4 border-b">${workshop.title}</td>
                <td class="py-3 px-4 border-b">
                    <span class="px-2 py-1 rounded-full text-xs font-medium ${statusClass}">
                        ${workshop.status.charAt(0).toUpperCase() + workshop.status.slice(1)}
                    </span>
                </td>
                <td class="py-3 px-4 border-b">${formattedDate}</td>
                <td class="py-3 px-4 border-b">${workshop.capacity || 'N/A'}</td>
                <td class="py-3 px-4 border-b">${workshop.registered || 0}</td>
                <td class="py-3 px-4 border-b">
                    <div class="flex space-x-2">
                        <button class="edit-workshop text-indigo-600 hover:text-indigo-800" data-id="${workshop.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button class="delete-workshop text-red-600 hover:text-red-800" data-id="${workshop.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                        <button class="view-registrations text-green-600 hover:text-green-800" data-id="${workshop.id}">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </button>
                    </div>
                </td>
            `;
            
            workshopsList.appendChild(row);
        });
        
        // Add event listeners to action buttons
        addActionButtonListeners();
        
    }).catch((error) => {
        console.error("Error getting workshops: ", error);
        workshopsList.innerHTML = `<tr><td colspan="6" class="py-4 px-4 text-center text-red-500">Error loading workshops: ${error.message}</td></tr>`;
    });
}

// Add event listeners to edit/delete/view buttons
function addActionButtonListeners() {
    // Edit workshop buttons
    document.querySelectorAll('.edit-workshop').forEach(button => {
        button.addEventListener('click', () => {
            const workshopId = button.getAttribute('data-id');
            editWorkshop(workshopId);
        });
    });
    
    // Delete workshop buttons
    document.querySelectorAll('.delete-workshop').forEach(button => {
        button.addEventListener('click', () => {
            const workshopId = button.getAttribute('data-id');
            confirmDeleteWorkshop(workshopId);
        });
    });
    
    // View registrations buttons
    document.querySelectorAll('.view-registrations').forEach(button => {
        button.addEventListener('click', () => {
            const workshopId = button.getAttribute('data-id');
            viewRegistrations(workshopId);
        });
    });
}

// Open the workshop modal for creating a new workshop
function openWorkshopModal(workshopData = null) {
    const modal = document.getElementById('workshopModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('workshopForm');
    const workshopIdField = document.getElementById('workshopId');
    
    // Clear the form
    form.reset();
    
    if (workshopData) {
        // Edit existing workshop
        modalTitle.textContent = 'Edit Workshop';
        workshopIdField.value = workshopData.id;
        
        // Fill form with workshop data
        document.getElementById('title').value = workshopData.title || '';
        document.getElementById('description').value = workshopData.description || '';
        document.getElementById('status').value = workshopData.status || 'upcoming';
        document.getElementById('capacity').value = workshopData.capacity || '';
        document.getElementById('location').value = workshopData.location || '';
        
        // Format date for datetime-local input
        if (workshopData.date) {
            const date = workshopData.date.toDate();
            const formattedDate = date.toISOString().slice(0, 16); // Format: YYYY-MM-DDTHH:MM
            document.getElementById('date').value = formattedDate;
        }
    } else {
        // New workshop
        modalTitle.textContent = 'Create New Workshop';
        workshopIdField.value = '';
    }
    
    // Show the modal
    modal.classList.remove('hidden');
}

// Close the workshop modal
function closeWorkshopModal() {
    const modal = document.getElementById('workshopModal');
    modal.classList.add('hidden');
}

// Handle workshop form submission
function handleWorkshopSubmit(e) {
    e.preventDefault();
    
    const form = document.getElementById('workshopForm');
    const workshopId = document.getElementById('workshopId').value;
    
    // Get form values
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const status = document.getElementById('status').value;
    const capacity = parseInt(document.getElementById('capacity').value);
    const location = document.getElementById('location').value;
    const dateString = document.getElementById('date').value;
    const date = new Date(dateString);
    
    // Create workshop data object
    const workshopData = {
        title,
        description,
        status,
        capacity,
        location,
        date: firebase.firestore.Timestamp.fromDate(date),
        lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // If creating a new workshop, add created timestamp
    if (!workshopId) {
        workshopData.created = firebase.firestore.FieldValue.serverTimestamp();
        workshopData.registered = 0; // Initialize registered count
    }
    
    // Save to Firestore
    const saveWorkshop = workshopId 
        ? db.collection('workshops').doc(workshopId).update(workshopData) 
        : db.collection('workshops').add(workshopData);
    
    saveWorkshop.then(() => {
        // Log the activity
        const activityType = workshopId ? 'Workshop Updated' : 'Workshop Created';
        const activityDetails = `${activityType}: ${title}`;
        
        logAdminActivity(activityType, activityDetails).then(() => {
            // Close modal and reload workshops
            closeWorkshopModal();
            loadWorkshops();
        });
    }).catch((error) => {
        console.error("Error saving workshop:", error);
        alert(`Error saving workshop: ${error.message}`);
    });
}

// Edit a workshop
function editWorkshop(workshopId) {
    db.collection('workshops').doc(workshopId).get().then((doc) => {
        if (doc.exists) {
            const workshopData = doc.data();
            workshopData.id = doc.id;
            openWorkshopModal(workshopData);
        } else {
            alert("Workshop not found!");
        }
    }).catch((error) => {
        console.error("Error getting workshop:", error);
        alert(`Error getting workshop: ${error.message}`);
    });
}

// Delete a workshop - confirmation
function confirmDeleteWorkshop(workshopId) {
    // Get workshop title first
    db.collection('workshops').doc(workshopId).get().then((doc) => {
        if (doc.exists) {
            const workshop = doc.data();
            
            // Set up confirmation modal
            const modal = document.getElementById('confirmationModal');
            const message = document.getElementById('confirmationMessage');
            const confirmBtn = document.getElementById('confirmAction');
            
            message.textContent = `Are you sure you want to delete the workshop "${workshop.title}"? This action cannot be undone.`;
            
            // Set up confirm button
            confirmBtn.onclick = () => {
                deleteWorkshop(workshopId, workshop.title);
                closeConfirmationModal();
            };
            
            // Show the modal
            modal.classList.remove('hidden');
        } else {
            alert("Workshop not found!");
        }
    }).catch((error) => {
        console.error("Error getting workshop:", error);
        alert(`Error getting workshop: ${error.message}`);
    });
}

// Close confirmation modal
function closeConfirmationModal() {
    const modal = document.getElementById('confirmationModal');
    modal.classList.add('hidden');
}

// Actually delete the workshop
function deleteWorkshop(workshopId, workshopTitle) {
    db.collection('workshops').doc(workshopId).delete().then(() => {
        // Log the activity
        logAdminActivity('Workshop Deleted', `Deleted workshop: ${workshopTitle}`).then(() => {
            loadWorkshops();
        });
    }).catch((error) => {
        console.error("Error deleting workshop:", error);
        alert(`Error deleting workshop: ${error.message}`);
    });
}

// View registrations for a workshop
function viewRegistrations(workshopId) {
    // For now, just store the ID in session storage and redirect
    sessionStorage.setItem('currentWorkshopId', workshopId);
    window.location.href = 'workshop-registrations.html';
}

// Logout function (reusing from admin-dashboard.js)
if (typeof logout !== 'function') {
    function logout() {
        // Log the logout activity
        logAdminActivity('Logout', 'Admin logged out')
            .then(() => {
                // Then sign out
                firebase.auth().signOut().then(() => {
                    window.location.href = 'login.html';
                }).catch((error) => {
                    console.error("Error signing out: ", error);
                    alert("Error signing out: " + error.message);
                });
            })
            .catch((error) => {
                console.error("Error logging activity: ", error);
                // Still try to sign out even if logging failed
                firebase.auth().signOut().then(() => {
                    window.location.href = 'login.html';
                });
            });
    }
}