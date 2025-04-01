document.addEventListener('DOMContentLoaded', () => {
    let currentUser = null;

    // Check if user is logged in
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = user; // Store the current user
            loadWorkshops();
        } else {
            window.location.href = 'login.html';
        }
    });

    // Load workshops from Firestore
    function loadWorkshops() {
        const workshopsList = document.getElementById('workshops-list');
        workshopsList.innerHTML = '<p class="text-gray-600 text-center">Loading workshops...</p>';

        db.collection('workshops')
            .orderBy('date', 'asc') // Order by date
            .get()
            .then((snapshot) => {
                workshopsList.innerHTML = ''; // Clear loading message

                if (snapshot.empty) {
                    workshopsList.innerHTML = '<p class="text-gray-600 text-center">No workshops found.</p>';
                    return;
                }

                snapshot.forEach((doc) => {
                    const workshop = doc.data();
                    const workshopId = doc.id;

                    // Format the date
                    const date = workshop.date.toDate();
                    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                    // Check if the current user is already registered
                    const isRegistered = workshop.registeredUsers && workshop.registeredUsers.includes(currentUser.uid);

                    // Create workshop card using Tailwind CSS
                    const workshopCard = document.createElement('div');
                    workshopCard.className = 'bg-white rounded-lg shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow transform hover:scale-105';
                    workshopCard.innerHTML = `
                        <h2 class="text-2xl font-bold text-gray-800 mb-4">${workshop.title}</h2>
                        <div class="space-y-2 text-gray-600">
                            <p><strong>Date:</strong> ${formattedDate}</p>
                            <p><strong>Location:</strong> ${workshop.location}</p>
                            <p><strong>Status:</strong> <span class="font-semibold ${getStatusColor(workshop.status)}">${workshop.status}</span></p>
                            <p><strong>Capacity:</strong> ${workshop.capacity}</p>
                            <p><strong>Registered:</strong> ${workshop.registered || 0}</p>
                        </div>
                        <div class="mt-4 p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors module-info" data-workshop-id="${workshopId}">
                            <h3 class="font-semibold text-gray-800 mb-2">Module Information</h3>
                            <div class="text-gray-600 text-sm max-h-24 overflow-hidden">
                                <p class="line-clamp-3">${workshop.moduleDescription || 'Click to view and edit module details'}</p>
                            </div>
                        </div>
                        <button class="mt-6 ${
                            isRegistered
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                        } text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto register-btn" data-id="${workshopId}" ${
                        isRegistered ? 'disabled' : ''
                    }>
                            ${isRegistered ? 'Registered' : 'Register'}
                        </button>
                    `;

                    workshopsList.appendChild(workshopCard);
                });

                // Add event listeners to register buttons
                document.querySelectorAll('.register-btn').forEach(button => {
                    button.addEventListener('click', () => {
                        const workshopId = button.getAttribute('data-id');
                        if (!button.disabled) {
                            registerForWorkshop(workshopId, currentUser.uid);
                        }
                    });
                });

                // Add event listeners to module info sections
                document.querySelectorAll('.module-info').forEach(moduleInfo => {
                    moduleInfo.addEventListener('click', () => {
                        const workshopId = moduleInfo.getAttribute('data-workshop-id');
                        viewModule(workshopId);
                    });
                });
            })
            .catch((error) => {
                console.error("Error loading workshops: ", error);
                workshopsList.innerHTML = `<p class="text-red-500 text-center">Error loading workshops: ${error.message}</p>`;
            });
    }

    // Function to handle workshop registration
    function registerForWorkshop(workshopId, userId) {
        const workshopRef = db.collection('workshops').doc(workshopId);

        db.runTransaction((transaction) => {
            return transaction.get(workshopRef).then((doc) => {
                if (!doc.exists) {
                    throw new Error('Workshop does not exist!');
                }

                const workshop = doc.data();
                const registeredUsers = workshop.registeredUsers || [];
                const registeredCount = workshop.registered || 0;

                // Check if the user is already registered
                if (registeredUsers.includes(userId)) {
                    throw new Error('You are already registered for this workshop.');
                }

                // Check if the workshop is full
                if (registeredCount >= workshop.capacity) {
                    throw new Error('This workshop is full.');
                }

                // Add the user to the registeredUsers array
                registeredUsers.push(userId);

                // Update the workshop document
                transaction.update(workshopRef, {
                    registeredUsers,
                    registered: registeredCount + 1,
                });
            });
        })
            .then(() => {
                alert('You have successfully registered for the workshop!');
                loadWorkshops(); // Reload workshops to reflect the changes
            })
            .catch((error) => {
                console.error('Registration failed: ', error);
                alert(`Registration failed: ${error.message}`);
            });
    }

    // Helper function to get status color
    function getStatusColor(status) {
        switch (status) {
            case 'active':
                return 'text-green-600';
            case 'upcoming':
                return 'text-blue-600';
            case 'completed':
                return 'text-gray-600';
            default:
                return 'text-gray-600';
        }
    }
});

function viewModule(workshopId) {
    // Remove any existing module details before fetching new ones
    closeModuleDetails();
    
    // Get the workshop data from Firestore
    db.collection('workshops').doc(workshopId).get()
        .then((doc) => {
            if (doc.exists) {
                const workshop = doc.data();
                showModuleDetails(workshop);
            }
        })
        .catch((error) => {
            console.error("Error getting workshop: ", error);
        });
}

function showModuleDetails(workshop) {
    // Check if a module details view already exists
    if (document.getElementById('moduleDetailsView')) {
        return; // Exit if a view already exists
    }

    const detailsHtml = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl">
                <div class="px-6 py-4 border-b border-gray-200">
                    <div class="flex justify-between items-center">
                        <h2 class="text-xl font-bold text-gray-800">${workshop.title} - Module Details</h2>
                        <button onclick="closeModuleDetails()" class="text-gray-500 hover:text-gray-700">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="p-6">
                    <div>
                        <label class="block text-sm font-medium text-gray-700">Description</label>
                        <textarea 
                            class="mt-1 w-full p-2 border border-gray-300 rounded-md resize-none overflow-y-auto"
                            style="height: 120px"
                            readonly
                        >${workshop.moduleDescription || ''}</textarea>
                    </div>
                    
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700">Learning Objectives</label>
                        <textarea 
                            class="mt-1 w-full p-2 border border-gray-300 rounded-md resize-none overflow-y-auto"
                            style="height: 120px"
                            readonly
                        >${workshop.moduleObjectives || ''}</textarea>
                    </div>
                    
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700">Prerequisites</label>
                        <textarea 
                            class="mt-1 w-full p-2 border border-gray-300 rounded-md resize-none overflow-y-auto"
                            style="height: 120px"
                            readonly
                        >${workshop.modulePrerequisites || ''}</textarea>
                    </div>
                    
                    <div class="mt-4">
                        <label class="block text-sm font-medium text-gray-700">Required Materials</label>
                        <textarea 
                            class="mt-1 w-full p-2 border border-gray-300 rounded-md resize-none overflow-y-auto"
                            style="height: 120px"
                            readonly
                        >${workshop.moduleMaterials || ''}</textarea>
                    </div>
                </div>

                <div class="px-6 py-4 border-t border-gray-200">
                    <div class="flex justify-end">
                        <button onclick="closeModuleDetails()" class="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded transition">
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Create a new div for the module details
    const detailsContainer = document.createElement('div');
    detailsContainer.id = 'moduleDetailsView';
    detailsContainer.innerHTML = detailsHtml;
    document.body.appendChild(detailsContainer);
}

function closeModuleDetails() {
    // Remove all existing module details views
    const existingViews = document.querySelectorAll('#moduleDetailsView');
    existingViews.forEach(view => view.remove());
}

