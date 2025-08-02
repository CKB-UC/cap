// workshop.js - Updated version

document.addEventListener('DOMContentLoaded', () => {
    loadWorkshops();
});

function loadWorkshops() {
    const workshopsList = document.getElementById('workshops-list');
    workshopsList.innerHTML = '<p class="text-gray-600 text-center">Loading workshops...</p>';

    db.collection('workshops')
        .orderBy('date', 'asc')
        .get()
        .then((snapshot) => {
            workshopsList.innerHTML = '';

            if (snapshot.empty) {
                workshopsList.innerHTML = '<p class="text-gray-600 text-center">No workshops found.</p>';
                return;
            }

            snapshot.forEach((doc) => {
                const workshop = doc.data();
                const workshopId = doc.id;
                const date = workshop.date.toDate();
                const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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
                    <button class="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto register-btn" data-id="${workshopId}">
                        Register Now
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
                    
                    // Show registration modal
                    showRegistrationModal({
                        id: workshopId,
                        title: workshopData.title,
                        date: workshopData.date,
                        location: workshopData.location
                    }, () => {
                        // Success callback
                        alert('Registration successful! Check your email for confirmation.');
                        loadWorkshops(); // Refresh the list
                    });
                });
            });
        })
        .catch((error) => {
            console.error("Error loading workshops: ", error);
            workshopsList.innerHTML = `<p class="text-red-500 text-center">Error loading workshops: ${error.message}</p>`;
        });
}

function getStatusColor(status) {
    switch (status) {
        case 'active': return 'text-green-600';
        case 'upcoming': return 'text-blue-600';
        case 'completed': return 'text-gray-600';
        default: return 'text-gray-600';
    }
}

workshopCard.innerHTML = `
    <h2 class="text-2xl font-bold text-gray-800 mb-4">${workshop.title}</h2>
    <div class="space-y-2 text-gray-600">
        <p><strong>Date:</strong> ${formattedDate}</p>
        <p><strong>Location:</strong> ${workshop.location}</p>
        <p><strong>Status:</strong> <span class="font-semibold ${getStatusColor(workshop.status)}">${workshop.status}</span></p>
        ${workshop.tags?.length ? `<p><strong>Tags:</strong> ${workshop.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ')}</p>` : ''}
        <p><strong>Capacity:</strong> ${workshop.capacity}</p>
        <p><strong>Registered:</strong> ${workshop.registered || 0}</p>
    </div>
    <button class="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto register-btn" data-id="${workshopId}">
        Register Now
    </button>
`;