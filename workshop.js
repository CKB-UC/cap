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
    // Redirect to the module details page with the workshop ID using the correct path
    window.location.href = `../module-details.html?id=${workshopId}`;
}

