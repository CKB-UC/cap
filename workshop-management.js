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
        default:
            statusStyles = {
                backgroundColor: '#e5e7eb', // Light gray
                color: '#000000',           // Black text
                borderColor: '#d1d5db'      // Gray border
            };
    }
    
    // Create inline style string directly
    const styleString = `background-color:${statusStyles.backgroundColor};color:${statusStyles.color};border-color:${statusStyles.borderColor}`;
    
    // Create the row HTML with inline styles for reliability
    row.innerHTML = `
        <td class="py-3 px-4 border-b">${workshop.title}</td>
        <td class="py-3 px-4 border-b">
            <span class="px-2 py-1 inline-block rounded-full text-xs font-medium" style="${styleString};border-width:1px;border-style:solid;font-weight:500;">
                ${workshop.status.charAt(0).toUpperCase() + workshop.status.slice(1)}
            </span>
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
                <button class="edit-workshop" data-id="${workshop.id}" title="Edit Workshop" style="background-color:#e0e7ff;color:#4338ca;border-color:#c7d2fe;padding:0.25rem 0.75rem;border-width:1px;border-radius:0.25rem;border-style:solid;transition:all 0.2s;">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-workshop" data-id="${workshop.id}" title="Delete Workshop" style="background-color:#fee2e2;color:#b91c1c;border-color:#fecaca;padding:0.25rem 0.75rem;border-width:1px;border-radius:0.25rem;border-style:solid;transition:all 0.2s;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </td>
    `;
    
    return row;
}

// Add event listeners to edit/delete buttons
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
        
        // Fill module information
        document.getElementById('moduleDescription').value = workshopData.moduleDescription || '';
        document.getElementById('moduleObjectives').value = workshopData.moduleObjectives || '';
        document.getElementById('modulePrerequisites').value = workshopData.modulePrerequisites || '';
        document.getElementById('moduleMaterials').value = workshopData.moduleMaterials || '';
        
        // Format date for date and time inputs
        if (workshopData.date) {
            const date = workshopData.date.toDate();
            
            // Format date as YYYY-MM-DD
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            
            // Format time as HH:MM
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const formattedTime = `${hours}:${minutes}`;
            
            document.getElementById('workshopDate').value = formattedDate;
            document.getElementById('workshopTime').value = formattedTime;
        }
    } else {
        // New workshop
        modalTitle.textContent = 'Create New Workshop';
        workshopIdField.value = '';
        
        // Set default status for new workshop
        document.getElementById('status').value = 'upcoming';
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
            location: document.getElementById('location').value,
            moduleDescription: document.getElementById('moduleDescription').value,
            moduleObjectives: document.getElementById('moduleObjectives').value,
            modulePrerequisites: document.getElementById('modulePrerequisites').value,
            moduleMaterials: document.getElementById('moduleMaterials').value,
            videoUrl: videoUrl,
            updatedAt: new Date()
        };
        
        if (workshopId) {
            // Update existing workshop
            await db.collection('workshops').doc(workshopId).update(workshopData);
        } else {
            // Create new workshop
            workshopData.createdAt = new Date();
            workshopData.registered = 0;
            await db.collection('workshops').add(workshopData);
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
        document.getElementById('workshopId').value = workshopId;
        document.getElementById('title').value = workshop.title;
        document.getElementById('description').value = workshop.description;
        document.getElementById('workshopDate').value = workshop.date.toDate().toISOString().split('T')[0];
        document.getElementById('workshopTime').value = workshop.date.toDate().toTimeString().slice(0, 5);
        document.getElementById('capacity').value = workshop.capacity;
        document.getElementById('status').value = workshop.status;
        document.getElementById('location').value = workshop.location;
        document.getElementById('moduleDescription').value = workshop.moduleDescription || '';
        document.getElementById('moduleObjectives').value = workshop.moduleObjectives || '';
        document.getElementById('modulePrerequisites').value = workshop.modulePrerequisites || '';
        document.getElementById('moduleMaterials').value = workshop.moduleMaterials || '';
        
        // Handle existing video
        if (workshop.videoUrl) {
            document.getElementById('videoFileName').textContent = 'Video already uploaded';
            const videoPreview = document.getElementById('videoPreview');
            const videoPlayer = document.getElementById('videoPlayer');
            videoPreview.classList.remove('hidden');
            videoPlayer.src = workshop.videoUrl;
        }
        
        openWorkshopModal();
    } catch (error) {
        console.error('Error loading workshop:', error);
        alert('Error loading workshop details. Please try again.');
    }
}

// Confirm delete workshop
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

// Delete the workshop
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

// Logout function
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