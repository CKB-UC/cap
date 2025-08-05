document.addEventListener('DOMContentLoaded', () => {
    loadWorkshops();
});

async function loadWorkshops() {
    const workshopsList = document.getElementById('workshops-list');
    workshopsList.innerHTML = '<p class="text-gray-600 text-center">Loading workshops...</p>';

    try {
        const snapshot = await db.collection('workshops')
            .orderBy('date', 'asc')
            .get();

        workshopsList.innerHTML = '';

        if (snapshot.empty) {
            workshopsList.innerHTML = '<p class="text-gray-600 text-center">No workshops found.</p>';
            return;
        }

        // Get current user's registrations if logged in
        const user = auth.currentUser;
        const userRegistrations = user ? await getUserRegistrations(user.uid) : [];

        snapshot.forEach((doc) => {
            const workshop = doc.data();
            const workshopId = doc.id;
            const date = workshop.date.toDate();
            const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const isRegistered = userRegistrations.includes(workshopId);

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
                <button class="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto register-btn" 
                        data-id="${workshopId}" 
                        id="btn-${workshopId}">
                    ${isRegistered ? 'Contact Us' : 'Register Now'}
                </button>
            `;

            workshopsList.appendChild(workshopCard);
        });

        // Add event listeners to register buttons
        document.querySelectorAll('.register-btn').forEach(button => {
            button.addEventListener('click', async () => {
                const workshopId = button.getAttribute('data-id');
                const workshopDoc = await db.collection('workshops').doc(workshopId).get();
                const workshopData = workshopDoc.data();
                
                // If already registered, redirect to contact page
                if (button.textContent.trim() === 'Contact Us') {
                    window.location.href = 'contact.html';
                    return;
                }
                
                // Check if user is logged in
                const user = auth.currentUser;
                
                if (user) {
                    // User is logged in, register them for the workshop
                    await registerForWorkshop(user, workshopId, workshopData);
                    // Show success popup
                    showSuccessPopup(workshopData);
                    // Update only this button to "Contact Us"
                    button.textContent = 'Contact Us';
                } else {
                    // User is not logged in, show registration form
                    showRegistrationForm(workshopId, workshopData, () => {
                        // Success callback
                        showSuccessPopup(workshopData);
                        // Update only this button to "Contact Us"
                        document.querySelector(`#btn-${workshopId}`).textContent = 'Contact Us';
                    });
                }
            });
        });
    } catch (error) {
        console.error("Error loading workshops: ", error);
        workshopsList.innerHTML = `<p class="text-red-500 text-center">Error loading workshops: ${error.message}</p>`;
    }
}

async function getUserRegistrations(userId) {
    try {
        const snapshot = await db.collection('users')
            .doc(userId)
            .collection('registrations')
            .get();
        return snapshot.docs.map(doc => doc.id);
    } catch (error) {
        console.error("Error getting user registrations: ", error);
        return [];
    }
}

function getStatusColor(status) {
    switch (status) {
        case 'active': return 'text-green-600';
        case 'upcoming': return 'text-blue-600';
        case 'completed': return 'text-gray-600';
        default: return 'text-gray-600';
    }
}

function showRegistrationForm(workshopId, workshopData) {
    // Create registration popup
    const popupContainer = document.createElement('div');
    popupContainer.id = 'registration-popup';
    popupContainer.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                <div class="bg-gradient-to-r from-blue-600 to-blue-500 p-6 text-white">
                    <div class="flex justify-between items-center">
                        <h2 class="text-2xl font-bold">Register for Workshop</h2>
                        <button class="close-registration text-white hover:text-blue-200 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div class="mt-2 text-blue-100">${workshopData.title}</div>
                </div>
                
                <div class="p-6">
                    <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
                        <div class="flex items-start space-x-3">
                            <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <p class="font-medium text-gray-700">${workshopData.date.toDate().toLocaleDateString()}, ${workshopData.date.toDate().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                                <p class="text-sm text-gray-500">Workshop Date & Time</p>
                            </div>
                        </div>
                        <div class="flex items-start space-x-3 mt-3">
                            <div class="bg-blue-100 p-2 rounded-full text-blue-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="font-medium text-gray-700">${workshopData.location}</p>
                                <p class="text-sm text-gray-500">Workshop Location</p>
                            </div>
                        </div>
                    </div>
                    
                    <form id="workshop-registration-form" class="space-y-4">
                        <div>
                            <label for="registerName" class="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" id="registerName" required 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                        </div>
                        <div>
                            <label for="registerEmail" class="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                            <input type="email" id="registerEmail" required 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                        </div>
                        <div>
                            <label for="registerPassword" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input type="password" id="registerPassword" required minlength="6"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                            <p class="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                        </div>
                        <div>
                            <label for="registerPhone" class="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input type="tel" id="registerPhone" required 
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                                placeholder="e.g., 09123456789">
                        </div>
                        <input type="hidden" id="workshopId" value="${workshopId}">
                        
                        <button type="submit" 
                            class="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-[1.01] shadow-md">
                            Register and Join Workshop
                        </button>
                    </form>
                    <div id="error-message" class="text-red-500 text-sm mt-3 text-center"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popupContainer);
    
    // Close button functionality
    const closeButton = popupContainer.querySelector('.close-registration');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(popupContainer);
    });
    
    // Form submission
    const form = popupContainer.querySelector('#workshop-registration-form');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = form.querySelector('#registerName').value;
        const email = form.querySelector('#registerEmail').value;
        const password = form.querySelector('#registerPassword').value;
        const phone = form.querySelector('#registerPhone').value;
        const workshopId = form.querySelector('#workshopId').value;
        
        // Basic validation
        if (!name || !email || !password || !phone) {
            document.getElementById('error-message').textContent = 'Please fill in all fields';
            return;
        }
        
        // Phone validation (Philippine format)
        const phoneRegex = /^(09|\+639)\d{9}$/;
        if (!phoneRegex.test(phone)) {
            document.getElementById('error-message').textContent = 'Please enter a valid Philippine phone number (e.g., 09123456789)';
            return;
        }
        
        try {
            // Create user account
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            const user = userCredential.user;
            
            // Save user data
            await db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                phone: phone,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Register for workshop
            await registerForWorkshop(user, workshopId);
            
            // Close the registration popup
            document.body.removeChild(popupContainer);
            
            // Show success popup
            showSuccessPopup(workshopData);
            
            // Refresh workshops list
            loadWorkshops();
        } catch (error) {
            document.getElementById('error-message').textContent = error.message;
        }
    });
}

function showSuccessPopup(workshopData) {
    const successPopup = document.createElement('div');
    successPopup.id = 'success-popup';
    successPopup.innerHTML = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
            <div class="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 overflow-hidden text-center">
                <div class="bg-gradient-to-r from-green-600 to-green-500 p-6 text-white">
                    <div class="flex justify-center">
                        <div class="bg-white/20 p-3 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                    </div>
                    <h2 class="text-2xl font-bold mt-4">Registration Successful!</h2>
                </div>
                
                <div class="p-6">
                    <div class="mb-6">
                        <h3 class="text-xl font-semibold text-gray-800">${workshopData.title}</h3>
                        <p class="text-gray-600 mt-1">You're all set for this workshop</p>
                    </div>
                    
                    <div class="bg-gray-50 rounded-lg p-4 mb-6">
                        <div class="flex items-center justify-center space-x-3">
                            <div class="bg-green-100 p-2 rounded-full text-green-600">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <p class="font-medium text-gray-700">Confirmation sent to your email</p>
                            </div>
                        </div>
                    </div>
                    
                    <button id="success-close-btn" 
                        class="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white py-3 rounded-lg font-medium transition-all transform hover:scale-[1.01] shadow-md">
                        Continue Browsing
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(successPopup);
    
    // Close button functionality
    const closeButton = successPopup.querySelector('#success-close-btn');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(successPopup);
    });
}

async function registerForWorkshop(user, workshopId, workshopData = null) {
    if (!workshopData) {
        const workshopDoc = await db.collection('workshops').doc(workshopId).get();
        workshopData = workshopDoc.data();
    }
    
    // Check if workshop is full
    if (workshopData.registered >= workshopData.capacity) {
        alert('This workshop is already full. Please try another one.');
        return;
    }
    
    try {
        // Add registration to workshop
        await db.collection('workshops').doc(workshopId).update({
            registered: firebase.firestore.FieldValue.increment(1)
        });
        
        // Add workshop to user's registrations
        await db.collection('users').doc(user.uid).collection('registrations').doc(workshopId).set({
            workshopId: workshopId,
            title: workshopData.title,
            date: workshopData.date,
            location: workshopData.location,
            registeredAt: firebase.firestore.FieldValue.serverTimestamp()
        });
    } catch (error) {
        console.error("Error registering for workshop: ", error);
        alert('There was an error registering for the workshop. Please try again.');
        throw error; // Re-throw to handle in calling function
    }
}