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

// Cloudinary Configuration
const CLOUDINARY_CONFIG = {
    cloudName: 'dwziuduck',
    uploadPreset: 'workshop-videos',
    apiKey: '966829156357797'
};

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
    
    // Video file input change
    document.getElementById('workshopVideo').addEventListener('change', handleVideoSelect);
    
    // Registered users modal
    document.getElementById('closeRegisteredUsersModal').addEventListener('click', closeRegisteredUsersModal);
    document.getElementById('closeRegisteredUsersBtn').addEventListener('click', closeRegisteredUsersModal);
    
    // Add recalculate registrations button
    addRecalculateButton();
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
            
            // Filter out archived workshops by default unless specifically requested
            if (statusFilter === 'all' && workshop.status === 'archived') {
                return; // Skip archived workshops in default view
            }
            
            // Format the date
            const date = workshop.date?.toDate() || new Date();
            const formattedDate = date.toLocaleDateString();
            const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            // Create row with status badge and color-coded buttons
            const row = createWorkshopRow(workshop, formattedDate, formattedTime);
            workshopsList.appendChild(row);
        });
        
        // Add event listeners to action buttons
        addActionButtonListeners();
        
    }).catch((error) => {
        console.error("Error getting workshops: ", error);
        workshopsList.innerHTML = `<tr><td colspan="6" class="py-4 px-4 text-center text-red-500">Error loading workshops: ${error.message}</td></tr>`;
    });
}

// CreateWorkshopRow function with color scheme
function createWorkshopRow(workshop, formattedDate, formattedTime) {
    const row = document.createElement('tr');
    row.className = 'hover:bg-gray-50';
    
    // Add special styling for archived workshops
    if (workshop.status === 'archived') {
        row.className += ' bg-gray-100 opacity-75';
    }
    
    // Determine status badge style with alternative colors
    let statusStyles = {};
    
    switch(workshop.status) {
        case 'active':
            // Alternative Light Green for Active
            statusStyles = {
                backgroundColor: '#c6f6d5', // Lighter green alternative
                color: '#000000',           // Black text
                borderColor: '#9ae6b4'      // Light green border
            };
            break;
        case 'upcoming':
            // Green for Upcoming
            statusStyles = {
                backgroundColor: '#48bb78', // Different green shade
                color: '#000000',           // Black text
                borderColor: '#38a169'      // Green border
            };
            break;
        case 'postponed':
            // Alternative Red for Postponed
            statusStyles = {
                backgroundColor: '#feb2b2', // Lighter red alternative
                color: '#000000',           // Black text
                borderColor: '#fc8181'      // Light red border
            };
            break;
        case 'completed':
            // Alternative Yellow for Completed
            statusStyles = {
                backgroundColor: '#fefcbf', // Lighter yellow alternative
                color: '#000000',           // Black text
                borderColor: '#faf089'      // Light yellow border
            };
            break;
        case 'archived':
            // Gray for Archived
            statusStyles = {
                backgroundColor: '#9ca3af', // Gray
                color: '#ffffff',           // White text
                borderColor: '#6b7280'      // Darker gray border
            };
            break;
        default:
            statusStyles = {
                backgroundColor: '#e5e7eb', // Light gray
                color: '#000000',           // Black text
                borderColor: '#d1d5db'      // Gray border
            };
    }
    
    let tagStyles = {};
    if (workshop.tag) {
        const tagColors = {
            communication: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
            teamwork: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
            leadership: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
            creativity: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' },
            'problem-solving': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
            technical: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
            management: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' }
        };
        
        tagStyles = tagColors[workshop.tag] || { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }

    // Create inline style string directly
    const styleString = `background-color:${statusStyles.backgroundColor};color:${statusStyles.color};border-color:${statusStyles.borderColor}`;

    // Update the row HTML to include tags
    row.innerHTML = `
        <td class="py-3 px-4 border-b">
            ${workshop.status === 'archived' ? `<span class="text-gray-500 mr-2">📁</span>` : ''}
            ${workshop.title}
        </td>
        <td class="py-3 px-4 border-b">
            <span class="px-2 py-1 inline-block rounded-full text-xs font-medium" style="${styleString};border-width:1px;border-style:solid;font-weight:500;">
                ${workshop.status.charAt(0).toUpperCase() + workshop.status.slice(1)}
            </span>
        </td>
        <td class="py-3 px-4 border-b">
            ${workshop.tag ? `
            <span class="${tagStyles.bg} ${tagStyles.text} ${tagStyles.border} px-2 py-1 inline-block rounded-full text-xs font-medium border">
                ${workshop.tag.charAt(0).toUpperCase() + workshop.tag.slice(1).replace('-', ' ')}
            </span>
            ` : 'N/A'}
        </td>
        <td class="py-3 px-4 border-b">
            <div class="flex flex-col">
                <span class="font-medium">${formattedDate}</span>
                <span class="text-sm text-gray-500">${formattedTime}</span>
            </div>
        </td>
        <td class="py-3 px-4 border-b">${workshop.capacity || 'N/A'}</td>
        <td class="py-3 px-4 border-b">${workshop.registered || 0}</td>
        <td class="py-3 px-4 border-b">
            <div class="flex space-x-2">
                ${workshop.status === 'archived' ? `
                    <button class="unarchive-workshop" data-id="${workshop.id}" title="Unarchive Workshop" style="background-color:#dcfce7;color:#166534;border-color:#bbf7d0;padding:0.25rem 0.75rem;border-width:1px;border-radius:0.25rem;border-style:solid;transition:all 0.2s;">
                        <i class="fas fa-undo"></i> Unarchive
                    </button>
                    <button class="permanent-delete-workshop" data-id="${workshop.id}" title="Permanently Delete Workshop" style="background-color:#fee2e2;color:#b91c1c;border-color:#fecaca;padding:0.25rem 0.75rem;border-width:1px;border-radius:0.25rem;border-style:solid;transition:all 0.2s;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : `
                    <button class="edit-workshop" data-id="${workshop.id}" title="Edit Workshop" style="background-color:#e0e7ff;color:#4338ca;border-color:#c7d2fe;padding:0.25rem 0.75rem;border-width:1px;border-radius:0.25rem;border-style:solid;transition:all 0.2s;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="archive-workshop" data-id="${workshop.id}" title="Archive Workshop" style="background-color:#fef3c7;color:#92400e;border-color:#fde68a;padding:0.25rem 0.75rem;border-width:1px;border-radius:0.25rem;border-style:solid;transition:all 0.2s;">
                        <i class="fas fa-archive"></i> Archive
                    </button>
                `}
                <button class="show-registered-users" data-id="${workshop.id}" data-title="${workshop.title}" title="Show Registered Users" style="background-color:#dbeafe;color:#1e40af;border-color:#bfdbfe;padding:0.25rem 0.75rem;border-width:1px;border-radius:0.25rem;border-style:solid;transition:all 0.2s;">
                    <i class="fas fa-users"></i> Users (${workshop.registered || 0})
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Add event listeners to action buttons
function addActionButtonListeners() {
    // Edit workshop buttons
    document.querySelectorAll('.edit-workshop').forEach(button => {
        button.addEventListener('click', () => {
            const workshopId = button.getAttribute('data-id');
            editWorkshop(workshopId);
        });
    });
    
    // Archive workshop buttons
    document.querySelectorAll('.archive-workshop').forEach(button => {
        button.addEventListener('click', () => {
            const workshopId = button.getAttribute('data-id');
            confirmArchiveWorkshop(workshopId);
        });
    });
    
    // Unarchive workshop buttons
    document.querySelectorAll('.unarchive-workshop').forEach(button => {
        button.addEventListener('click', () => {
            const workshopId = button.getAttribute('data-id');
            unarchiveWorkshop(workshopId);
        });
    });
    
    // Permanent delete workshop buttons
    document.querySelectorAll('.permanent-delete-workshop').forEach(button => {
        button.addEventListener('click', () => {
            const workshopId = button.getAttribute('data-id');
            confirmPermanentDeleteWorkshop(workshopId);
        });
    });
    
    // Show registered users buttons
    document.querySelectorAll('.show-registered-users').forEach(button => {
        button.addEventListener('click', () => {
            const workshopId = button.getAttribute('data-id');
            const workshopTitle = button.getAttribute('data-title');
            showRegisteredUsers(workshopId, workshopTitle);
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
        document.getElementById('workshopTag').value = workshopData.tag || '';
        document.getElementById('capacity').value = workshopData.capacity || '';
        document.getElementById('location').value = workshopData.location || '';
        
        // Set selected tags
        const tagSelect = document.getElementById('workshopTags');
        if (workshopData.tags) {
            Array.from(tagSelect.options).forEach(option => {
                option.selected = workshopData.tags.includes(option.value);
            });
        }
        
        // Fill module information
        document.getElementById('moduleDescription').value = workshopData.moduleDescription || '';
        document.getElementById('moduleObjectives').value = workshopData.moduleObjectives || '';
        document.getElementById('modulePrerequisites').value = workshopData.modulePrerequisites || '';
        document.getElementById('moduleMaterials').value = workshopData.moduleMaterials || '';
        
        // Format date for date and time inputs
        if (workshopData.date) {
            const date = workshopData.date.toDate();
            document.getElementById('workshopDate').value = date.toISOString().split('T')[0];
            document.getElementById('workshopTime').value = date.toTimeString().slice(0, 5);
        }
        
        // Handle existing video
        if (workshopData.videoUrl) {
            document.getElementById('videoFileName').textContent = 'Video already uploaded';
            const videoPreview = document.getElementById('videoPreview');
            const videoPlayer = document.getElementById('videoPlayer');
            videoPreview.classList.remove('hidden');
            videoPlayer.src = workshopData.videoUrl;
        }
    } else {
        // New workshop
        modalTitle.textContent = 'Create New Workshop';
        workshopIdField.value = '';
        
        // Set default status for new workshop
        document.getElementById('status').value = 'upcoming';
        document.getElementById('workshopTag').value = '';
    }
    
    // Show the modal
    modal.classList.remove('hidden');
}

// Close the workshop modal
function closeWorkshopModal() {
    const modal = document.getElementById('workshopModal');
    modal.classList.add('hidden');
}

// Handle video file selection
function handleVideoSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Update file name display
    document.getElementById('videoFileName').textContent = file.name;

    // Show video preview
    const videoPreview = document.getElementById('videoPreview');
    const videoPlayer = document.getElementById('videoPlayer');
    videoPreview.classList.remove('hidden');
    
    const videoUrl = URL.createObjectURL(file);
    videoPlayer.src = videoUrl;
}

// Upload video to Cloudinary
async function uploadVideoToCloudinary(file) {
    return new Promise((resolve, reject) => {
        const uploadProgress = document.getElementById('uploadProgress');
        const progressBar = document.getElementById('progressBar');
        const uploadStatus = document.getElementById('uploadStatus');
        
        uploadProgress.classList.remove('hidden');
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
        formData.append('cloud_name', CLOUDINARY_CONFIG.cloudName);
        formData.append('api_key', CLOUDINARY_CONFIG.apiKey);
        
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`, true);
        
        xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
                const percent = Math.round((e.loaded / e.total) * 100);
                progressBar.style.width = `${percent}%`;
                uploadStatus.textContent = `Uploading: ${percent}%`;
            }
        };
        
        xhr.onload = () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                uploadStatus.textContent = 'Upload complete!';
                setTimeout(() => {
                    uploadProgress.classList.add('hidden');
                }, 2000);
                resolve(response.secure_url);
            } else {
                console.error('Error uploading video:', xhr.responseText);
                uploadProgress.classList.add('hidden');
                reject(new Error('Upload failed'));
            }
        };
        
        xhr.onerror = () => {
            console.error('Error uploading video');
            uploadProgress.classList.add('hidden');
            reject(new Error('Upload failed'));
        };
        
        xhr.send(formData);
    });
}

// Handle workshop form submission
async function handleWorkshopSubmit(e) {
    e.preventDefault();
    
    const workshopId = document.getElementById('workshopId').value;
    const videoFile = document.getElementById('workshopVideo').files[0];
    
    try {
        let videoUrl = null;
        if (videoFile) {
            videoUrl = await uploadVideoToCloudinary(videoFile);
        }
        
        const workshopData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            date: new Date(`${document.getElementById('workshopDate').value}T${document.getElementById('workshopTime').value}`),
            capacity: parseInt(document.getElementById('capacity').value),
            status: document.getElementById('status').value,
            tag: document.getElementById('workshopTag').value, // Single tag selection
            location: document.getElementById('location').value,
            moduleDescription: document.getElementById('moduleDescription').value,
            moduleObjectives: document.getElementById('moduleObjectives').value,
            modulePrerequisites: document.getElementById('modulePrerequisites').value,
            moduleMaterials: document.getElementById('moduleMaterials').value,
            updatedAt: new Date()
        };

        // Only add videoUrl if a new video was uploaded
        if (videoUrl) {
            workshopData.videoUrl = videoUrl;
        }
        
        if (workshopId) {
            // Update existing workshop
            const workshopRef = db.collection('workshops').doc(workshopId);
            const workshopDoc = await workshopRef.get();
            
            if (!workshopDoc.exists) {
                throw new Error('Workshop not found');
            }
            
            // Preserve existing registration data
            const existingData = workshopDoc.data();
            workshopData.registered = existingData.registered || 0;
            workshopData.registeredUsers = existingData.registeredUsers || [];
            workshopData.createdAt = existingData.createdAt;
            
            await workshopRef.update(workshopData);
            
            // Log the workshop edit activity
            await logAdminActivity('Workshop Edited', `Edited workshop: ${workshopData.title}`);
            
            // Send notification to registered users about workshop update
            if (existingData.registeredUsers && existingData.registeredUsers.length > 0) {
                try {
                    await NotificationSystem.sendWorkshopNotification(
                        workshopId,
                        `Workshop Updated: ${workshopData.title}`,
                        `The workshop "${workshopData.title}" has been updated. Please check the new details and schedule.`,
                        'workshop_update'
                    );
                } catch (notificationError) {
                    console.error('Error sending workshop update notification:', notificationError);
                }
            }
        } else {
            // Create new workshop
            workshopData.createdAt = new Date();
            workshopData.registered = 0;
            workshopData.registeredUsers = [];
            const docRef = await db.collection('workshops').add(workshopData);
            
            // Log the workshop creation activity
            await logAdminActivity('Workshop Created', `Created new workshop: ${workshopData.title}`);
            
            // Send notification to all users about new workshop
            try {
                await NotificationSystem.createNotification({
                    title: `New Workshop Available: ${workshopData.title}`,
                    message: `A new workshop "${workshopData.title}" is now available for registration. Check it out!`,
                    type: 'workshop_update',
                    priority: 'medium',
                    targetUsers: 'all',
                    workshopId: docRef.id
                });
            } catch (notificationError) {
                console.error('Error sending new workshop notification:', notificationError);
            }
        }
        
        closeWorkshopModal();
        loadWorkshops();
    } catch (error) {
        console.error('Error saving workshop:', error);
        alert('Error saving workshop. Please try again.');
    }
}

// Edit workshop function
async function editWorkshop(workshopId) {
    try {
        const workshopDoc = await db.collection('workshops').doc(workshopId).get();
        if (!workshopDoc.exists) {
            throw new Error('Workshop not found');
        }
        
        const workshop = workshopDoc.data();
        workshop.id = workshopId; // Add the ID to the workshop data
        
        // Pass the workshop data to openWorkshopModal
        openWorkshopModal(workshop);
    } catch (error) {
        console.error('Error loading workshop:', error);
        alert('Error loading workshop details. Please try again.');
    }
}

// Confirm archive workshop
function confirmArchiveWorkshop(workshopId) {
    // Get workshop title first
    db.collection('workshops').doc(workshopId).get().then((doc) => {
        if (doc.exists) {
            const workshop = doc.data();
            
            // Set up confirmation modal
            const modal = document.getElementById('confirmationModal');
            const message = document.getElementById('confirmationMessage');
            const confirmBtn = document.getElementById('confirmAction');
            
            message.textContent = `Are you sure you want to archive the workshop "${workshop.title}"? This will hide it from active workshops but you can restore it later.`;
            confirmBtn.textContent = 'Archive Workshop';
            confirmBtn.className = 'modal-button modal-button-confirm';
            
            // Set up confirm button
            confirmBtn.onclick = () => {
                archiveWorkshop(workshopId, workshop.title);
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

// Confirm permanent delete workshop
function confirmPermanentDeleteWorkshop(workshopId) {
    // Get workshop title first
    db.collection('workshops').doc(workshopId).get().then((doc) => {
        if (doc.exists) {
            const workshop = doc.data();
            
            // Set up confirmation modal
            const modal = document.getElementById('confirmationModal');
            const message = document.getElementById('confirmationMessage');
            const confirmBtn = document.getElementById('confirmAction');
            
            message.textContent = `Are you sure you want to permanently delete the workshop "${workshop.title}"? This action cannot be undone and the workshop will be lost forever.`;
            confirmBtn.textContent = 'Permanently Delete';
            confirmBtn.className = 'modal-button modal-button-danger';
            
            // Set up confirm button
            confirmBtn.onclick = () => {
                permanentDeleteWorkshop(workshopId, workshop.title);
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

// Show success message
function showSuccessMessage(message) {
    const successMessage = document.getElementById('successMessage');
    const successMessageText = document.getElementById('successMessageText');
    
    successMessageText.textContent = message;
    successMessage.classList.remove('hidden');
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        successMessage.classList.add('hidden');
    }, 3000);
}

// Archive the workshop
function archiveWorkshop(workshopId, workshopTitle) {
    db.collection('workshops').doc(workshopId).get().then((doc) => {
        if (doc.exists) {
            const workshop = doc.data();
            // Store the current status before archiving
            const currentStatus = workshop.status;
            
            return db.collection('workshops').doc(workshopId).update({
                status: 'archived',
                previousStatus: currentStatus,
                archivedAt: new Date()
            });
        }
    }).then(() => {
        // Log the activity
        logAdminActivity('Workshop Archived', `Archived workshop: ${workshopTitle}`).then(() => {
            showSuccessMessage(`Workshop "${workshopTitle}" has been archived successfully.`);
            loadWorkshops();
        });
    }).catch((error) => {
        console.error("Error archiving workshop:", error);
        alert(`Error archiving workshop: ${error.message}`);
    });
}

// Unarchive the workshop
function unarchiveWorkshop(workshopId) {
    let previousStatus = 'upcoming'; // Default status
    
    db.collection('workshops').doc(workshopId).get().then((doc) => {
        if (doc.exists) {
            const workshop = doc.data();
            // Restore to the previous status or default to 'upcoming'
            previousStatus = workshop.previousStatus || 'upcoming';
            
            return db.collection('workshops').doc(workshopId).update({
                status: previousStatus,
                archivedAt: null,
                previousStatus: null
            });
        }
    }).then(() => {
        // Log the activity
        logAdminActivity('Workshop Unarchived', `Unarchived workshop: ${workshopId}`).then(() => {
            showSuccessMessage(`Workshop has been unarchived and restored to ${previousStatus} status.`);
            loadWorkshops();
        });
    }).catch((error) => {
        console.error("Error unarchiving workshop:", error);
        alert(`Error unarchiving workshop: ${error.message}`);
    });
}

// Permanently delete the workshop
function permanentDeleteWorkshop(workshopId, workshopTitle) {
    db.collection('workshops').doc(workshopId).delete().then(() => {
        // Log the activity
        logAdminActivity('Workshop Permanently Deleted', `Permanently deleted workshop: ${workshopTitle}`).then(() => {
            showSuccessMessage(`Workshop "${workshopTitle}" has been permanently deleted.`);
            loadWorkshops();
        });
    }).catch((error) => {
        console.error("Error permanently deleting workshop:", error);
        alert(`Error permanently deleting workshop: ${error.message}`);
    });
}

// Function to show logout popup
function showLogoutPopup() {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'logout-popup-overlay';
    
    // Create popup content
    const popup = document.createElement('div');
    popup.className = 'logout-popup';
    popup.innerHTML = `
        <div class="logout-popup-icon">
            <i class="fas fa-check"></i>
        </div>
        <div class="logout-popup-title">Successfully Logged Out</div>
        <div class="logout-popup-message">You have been logged out successfully.</div>
        <button class="logout-popup-button" onclick="closeLogoutPopup()">OK</button>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
        closeLogoutPopup();
    }, 3000);
}

// Function to close logout popup
function closeLogoutPopup() {
    const overlay = document.querySelector('.logout-popup-overlay');
    if (overlay) {
        overlay.remove();
    }
}

// Show registered users for a workshop
async function showRegisteredUsers(workshopId, workshopTitle) {
    try {
        // Show loading state
        const modal = document.getElementById('registeredUsersModal');
        const modalTitle = document.getElementById('registeredUsersModalTitle');
        const usersList = document.getElementById('registeredUsersList');
        
        modalTitle.textContent = `Registered Users - ${workshopTitle}`;
        usersList.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i><p class="mt-2 text-gray-500">Loading registered users...</p></div>';
        
        // Show the modal and prevent background scroll
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Get workshop data
        const workshopDoc = await db.collection('workshops').doc(workshopId).get();
        if (!workshopDoc.exists) {
            throw new Error('Workshop not found');
        }
        
        const workshop = workshopDoc.data();
        
        // Collect user IDs from both registration models:
        // 1) workshops.registeredUsers: [uid]
        // 2) users/{uid}/registrations/{workshopId}
        const userIdSet = new Set((workshop.registeredUsers || []).filter(Boolean));

        // Query collection group for registrations matching this workshop
        try {
            const regSnap = await db.collectionGroup('registrations')
                .where('workshopId', '==', workshopId)
                .get();
            regSnap.forEach(doc => {
                const uid = doc.ref.parent && doc.ref.parent.parent ? doc.ref.parent.parent.id : null;
                if (uid) userIdSet.add(uid);
            });
        } catch (cgErr) {
            console.warn('collectionGroup(registrations) query failed or unavailable:', cgErr);
        }

        const aggregatedUserIds = Array.from(userIdSet);

        if (aggregatedUserIds.length === 0) {
            usersList.innerHTML = `
                <div class="text-center py-8">
                    <i class="fas fa-users text-4xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">No users registered for this workshop yet.</p>
                </div>
            `;
            return;
        }

        // Get user details for each registered user
        console.log('Aggregated registered user IDs:', aggregatedUserIds);
        const userPromises = aggregatedUserIds.map(userId => db.collection('users').doc(userId).get());
        const userDocs = await Promise.all(userPromises);
        console.log('User documents found:', userDocs.filter(doc => doc.exists).length, 'out of', userDocs.length);
        
        // Only include users that exist and are not deleted
        const users = userDocs
            .filter(doc => doc.exists)
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(user => {
                // Filter out users that are marked as deleted or don't have essential data
                return user && 
                       !user.deleted && 
                       !user.isDeleted && 
                       (user.name || user.fullName || user.email);
            })
            .sort((a, b) => (a.name || a.fullName || a.email || '').localeCompare(b.name || b.fullName || b.email || ''));
        
        // Log filtered results for debugging
        console.log('Valid users after filtering:', users.length);
        const filteredOutCount = userDocs.filter(doc => doc.exists).length - users.length;
        if (filteredOutCount > 0) {
            console.log(`Filtered out ${filteredOutCount} deleted/non-existent users`);
        }
        
        // Clean up orphaned registrations (optional - can be enabled if needed)
        // await cleanupOrphanedRegistrations(workshopId, users.map(u => u.id));
        
        // Display users
        usersList.innerHTML = `
            <div class="mb-4">
                <div class="flex justify-between items-center">
                    <h3 class="text-lg font-semibold text-gray-800">Total Registered: ${users.length}</h3>
                    <span class="text-sm text-gray-500">Capacity: ${workshop.capacity || 'N/A'}</span>
                </div>
            </div>
            <div class="grid gap-4">
                ${users.map((user, index) => `
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                                    <span class="text-indigo-600 font-semibold">${(user.name || user.fullName || user.email || 'U').charAt(0).toUpperCase()}</span>
                                </div>
                                <div>
                                    <h4 class="font-medium text-gray-900">${user.name || user.fullName || 'No Name'}</h4>
                                    <p class="text-sm text-gray-600">${user.email || 'No Email'}</p>
                                    ${user.role ? `<span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mt-1">${user.role}</span>` : ''}
                                </div>
                            </div>
                            <div class="text-right">
                                <p class="text-sm text-gray-500">Registration #${index + 1}</p>
                                ${user.verificationStatus ? `
                                    <span class="inline-block text-xs px-2 py-1 rounded-full mt-1 ${
                                        user.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                                        user.verificationStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }">
                                        ${user.verificationStatus.charAt(0).toUpperCase() + user.verificationStatus.slice(1)}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                        ${user.demographics ? `
                            <div class="mt-3 pt-3 border-t border-gray-200">
                                <div class="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                    ${user.demographics.age ? `<div><span class="font-medium">Age:</span> ${user.demographics.age}</div>` : ''}
                                    ${user.demographics.gender ? `<div><span class="font-medium">Gender:</span> ${user.demographics.gender}</div>` : ''}
                                    ${user.demographics.occupation ? `<div><span class="font-medium">Occupation:</span> ${user.demographics.occupation}</div>` : ''}
                                    ${user.demographics.education ? `<div><span class="font-medium">Education:</span> ${user.demographics.education}</div>` : ''}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading registered users:', error);
        const usersList = document.getElementById('registeredUsersList');
        usersList.innerHTML = `
            <div class="text-center py-8">
                <i class="fas fa-exclamation-triangle text-4xl text-red-400 mb-4"></i>
                <p class="text-red-500 text-lg">Error loading registered users</p>
                <p class="text-gray-500 text-sm mt-2">${error.message}</p>
            </div>
        `;
    }
}

// Close registered users modal
function closeRegisteredUsersModal() {
    const modal = document.getElementById('registeredUsersModal');
    modal.classList.add('hidden');
    // Re-enable background scroll
    document.body.style.overflow = '';
}

// Clean up orphaned registrations for deleted users
async function cleanupOrphanedRegistrations(workshopId, validUserIds) {
    try {
        // Get all registered user IDs for this workshop
        const workshopDoc = await db.collection('workshops').doc(workshopId).get();
        if (!workshopDoc.exists) return;
        
        const workshop = workshopDoc.data();
        const allRegisteredUserIds = new Set(workshop.registeredUsers || []);
        
        // Find orphaned user IDs (registered but not in valid users)
        const orphanedUserIds = Array.from(allRegisteredUserIds).filter(uid => !validUserIds.includes(uid));
        
        if (orphanedUserIds.length > 0) {
            console.log(`Found ${orphanedUserIds.length} orphaned registrations for workshop ${workshopId}`);
            
            // Remove orphaned registrations from workshop document
            const updatedRegisteredUsers = Array.from(allRegisteredUserIds).filter(uid => validUserIds.includes(uid));
            
            await db.collection('workshops').doc(workshopId).update({
                registeredUsers: updatedRegisteredUsers,
                registered: updatedRegisteredUsers.length
            });
            
            console.log(`Cleaned up ${orphanedUserIds.length} orphaned registrations`);
        }
    } catch (error) {
        console.error('Error cleaning up orphaned registrations:', error);
    }
}

// Logout function
function logout() {
    // Log the logout activity
    logAdminActivity('Logout', 'Admin logged out')
        .then(() => {
            // Then sign out
            firebase.auth().signOut().then(() => {
                // Show logout popup
                showLogoutPopup();
                // Redirect after a short delay to allow popup to show
                setTimeout(() => {
                    window.location.href = 'login.html?logout=true';
                }, 2000);
            }).catch((error) => {
                console.error("Error signing out: ", error);
                alert("Error signing out: " + error.message);
            });
        })
        .catch((error) => {
            console.error("Error logging activity: ", error);
            // Still try to sign out even if logging failed
            firebase.auth().signOut().then(() => {
                // Show logout popup
                showLogoutPopup();
                // Redirect after a short delay to allow popup to show
                setTimeout(() => {
                    window.location.href = 'login.html?logout=true';
                }, 2000);
            });
        });
}

// Function to recalculate registration counts for all workshops
async function recalculateAllWorkshopRegistrations() {
    try {
        console.log('Starting registration count recalculation...');
        
        // Get all workshops
        const workshopsSnapshot = await db.collection('workshops').get();
        let totalUpdated = 0;
        let totalWorkshops = 0;
        
        for (const workshopDoc of workshopsSnapshot.docs) {
            const workshop = workshopDoc.data();
            const workshopId = workshopDoc.id;
            
            if (!workshop.registeredUsers || workshop.registeredUsers.length === 0) {
                // Skip workshops with no registrations
                continue;
            }
            
            totalWorkshops++;
            console.log(`Processing workshop: ${workshop.title} (${workshopId})`);
            
            // Get valid user IDs (users that still exist and are not deleted)
            const validUserIds = [];
            const userPromises = workshop.registeredUsers.map(userId => 
                db.collection('users').doc(userId).get()
            );
            
            const userDocs = await Promise.all(userPromises);
            
            for (let i = 0; i < userDocs.length; i++) {
                const userDoc = userDocs[i];
                const userId = workshop.registeredUsers[i];
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    // Check if user is not deleted and has essential data
                    if (userData && 
                        !userData.deleted && 
                        !userData.isDeleted && 
                        (userData.name || userData.fullName || userData.email)) {
                        validUserIds.push(userId);
                    } else {
                        console.log(`Filtered out deleted/invalid user: ${userId}`);
                    }
                } else {
                    console.log(`User document not found: ${userId}`);
                }
            }
            
            // Update workshop with corrected registration data
            const originalCount = workshop.registered || 0;
            const newCount = validUserIds.length;
            
            if (originalCount !== newCount) {
                await db.collection('workshops').doc(workshopId).update({
                    registeredUsers: validUserIds,
                    registered: newCount
                });
                
                totalUpdated++;
                console.log(`Updated workshop "${workshop.title}": ${originalCount} → ${newCount} registrations`);
            } else {
                console.log(`Workshop "${workshop.title}" already has correct count: ${newCount}`);
            }
        }
        
        console.log(`Recalculation complete! Updated ${totalUpdated} out of ${totalWorkshops} workshops.`);
        return { totalUpdated, totalWorkshops };
        
    } catch (error) {
        console.error('Error recalculating workshop registrations:', error);
        throw error;
    }
}

// Function to recalculate registration count for a specific workshop
async function recalculateWorkshopRegistration(workshopId) {
    try {
        const workshopDoc = await db.collection('workshops').doc(workshopId).get();
        if (!workshopDoc.exists) {
            throw new Error('Workshop not found');
        }
        
        const workshop = workshopDoc.data();
        
        if (!workshop.registeredUsers || workshop.registeredUsers.length === 0) {
            // No registrations to recalculate
            return { originalCount: 0, newCount: 0, updated: false };
        }
        
        // Get valid user IDs
        const validUserIds = [];
        const userPromises = workshop.registeredUsers.map(userId => 
            db.collection('users').doc(userId).get()
        );
        
        const userDocs = await Promise.all(userPromises);
        
        for (let i = 0; i < userDocs.length; i++) {
            const userDoc = userDocs[i];
            const userId = workshop.registeredUsers[i];
            
            if (userDoc.exists) {
                const userData = userDoc.data();
                if (userData && 
                    !userData.deleted && 
                    !userData.isDeleted && 
                    (userData.name || userData.fullName || userData.email)) {
                    validUserIds.push(userId);
                }
            }
        }
        
        const originalCount = workshop.registered || 0;
        const newCount = validUserIds.length;
        
        if (originalCount !== newCount) {
            await db.collection('workshops').doc(workshopId).update({
                registeredUsers: validUserIds,
                registered: newCount
            });
            
            console.log(`Updated workshop "${workshop.title}": ${originalCount} → ${newCount} registrations`);
            return { originalCount, newCount, updated: true };
        } else {
            return { originalCount, newCount, updated: false };
        }
        
    } catch (error) {
        console.error('Error recalculating workshop registration:', error);
        throw error;
    }
}

// Add button to recalculate all registrations
function addRecalculateButton() {
    console.log('addRecalculateButton called');
    const headerSection = document.querySelector('.flex.justify-between.items-center.mb-6');
    console.log('headerSection found:', headerSection);
    if (headerSection) {
        const recalculateBtn = document.createElement('button');
        recalculateBtn.id = 'recalculateRegistrationsBtn';
        recalculateBtn.className = 'bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded transition flex items-center space-x-2 border-2 border-red-500';
        recalculateBtn.style.cssText = 'display: inline-flex; visibility: visible; opacity: 1; background-color: #f97316; color: white; padding: 8px 16px; border-radius: 4px; border: 2px solid red;';
        recalculateBtn.innerHTML = `
            <i class="fas fa-sync-alt"></i>
            <span>Recalculate</span>
        `;
        recalculateBtn.title = 'Recalculate registration counts for all workshops';
        console.log('Button created:', recalculateBtn);
        
        recalculateBtn.addEventListener('click', async () => {
            if (confirm('This will recalculate registration counts for all workshops by checking which registered users still exist. This may take a few moments. Continue?')) {
                try {
                    recalculateBtn.disabled = true;
                    recalculateBtn.innerHTML = `
                        <i class="fas fa-spinner fa-spin"></i>
                        <span>Recalculating...</span>
                    `;
                    
                    const result = await recalculateAllWorkshopRegistrations();
                    
                    showSuccessMessage(`Successfully recalculated registrations! Updated ${result.totalUpdated} out of ${result.totalWorkshops} workshops.`);
                    
                    // Reload workshops to show updated counts
                    loadWorkshops();
                    
                } catch (error) {
                    console.error('Error during recalculation:', error);
                    alert(`Error recalculating registrations: ${error.message}`);
                } finally {
                    recalculateBtn.disabled = false;
                    recalculateBtn.innerHTML = `
                        <i class="fas fa-sync-alt"></i>
                        <span>Recalculate</span>
                    `;
                }
            }
        });
        
        // Insert button into the button container
        const buttonContainer = headerSection.querySelector('.flex.space-x-2');
        console.log('buttonContainer found:', buttonContainer);
        if (buttonContainer) {
            buttonContainer.appendChild(recalculateBtn);
            console.log('Button appended to container');
            console.log('Button container children:', buttonContainer.children.length);
            console.log('Button in DOM:', document.getElementById('recalculateRegistrationsBtn'));
        } else {
            // Fallback: insert after the Create New Workshop button
            const createBtn = headerSection.querySelector('#createWorkshopBtn');
            console.log('createBtn found:', createBtn);
            if (createBtn) {
                createBtn.parentNode.insertBefore(recalculateBtn, createBtn.nextSibling);
                console.log('Button inserted after create button');
            } else {
                headerSection.appendChild(recalculateBtn);
                console.log('Button appended to header section');
            }
        }
    }
}