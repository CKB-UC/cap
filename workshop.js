document.addEventListener('DOMContentLoaded', () => {
    loadWorkshops();
});

let workshopClickHandlerAttached = false;

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
        
        // Categorize workshops by status
        const workshopsByStatus = {
            active: [],
            upcoming: [],
            postponed: [],
            completed: []
        };

        snapshot.forEach((doc) => {
            const workshop = doc.data();
            workshop.id = doc.id;
            const status = workshop.status.toLowerCase();
            if (workshopsByStatus[status]) {
                workshopsByStatus[status].push(workshop);
            }
        });

        // Render workshops by status in order
        const statusOrder = ['active', 'upcoming', 'postponed', 'completed'];
        
        statusOrder.forEach(status => {
            if (workshopsByStatus[status].length > 0) {
                // Add status header
                const statusHeader = document.createElement('div');
                statusHeader.className = 'md:col-span-2';
                statusHeader.innerHTML = `
                    <h3 class="text-2xl font-bold text-gray-800 mb-4 capitalize">${status} Workshops</h3>
                    <div class="w-20 h-1 bg-blue-600 mb-6"></div>
                `;
                workshopsList.appendChild(statusHeader);

                // Add workshops for this status
                workshopsByStatus[status].forEach(workshop => {
                    const workshopId = workshop.id;
                    const date = workshop.date.toDate();
                    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                    const isRegistered = userRegistrations.includes(workshopId);
                    const hasRated = user ? workshop.ratings && workshop.ratings[user.uid] : false;

                    const workshopCard = document.createElement('div');
                    workshopCard.className = 'bg-white rounded-lg shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow transform hover:scale-105';
                    
                    let ratingSection = '';
                    if (status === 'completed') {
                        const canRate = user && isRegistered && !hasRated;
                        ratingSection = `
                            <div class="mt-4 border-t pt-4">
                                ${hasRated ? `
                                    <div class="flex items-center justify-between mb-3">
                                        <div class="flex items-center">
                                            <div class="flex stars-container">
                                                ${renderStars(workshop.ratings[user.uid].rating)}
                                            </div>
                                            <span class="ml-2 text-sm text-gray-600">Your rating</span>
                                        </div>
                                        ${workshop.ratings[user.uid].comment ? `
                                            <button class="text-blue-600 text-sm view-comment" data-comment="${workshop.ratings[user.uid].comment}">
                                                View your comment
                                            </button>
                                        ` : ''}
                                    </div>
                                ` : ''}
                                
                                ${workshop.ratings ? `
                                    <div class="text-sm text-gray-600 mb-3">
                                        Average rating: ${calculateAverageRating(workshop.ratings).toFixed(1)}/5 (${Object.keys(workshop.ratings).length} ratings)
                                    </div>
                                ` : ''}
                                
                                ${canRate ? `
                                    <button class="rate-workshop-btn bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors text-sm" 
                                            data-id="${workshopId}">
                                        Rate this workshop
                                    </button>
                                ` : ''}
                                
                                ${workshop.comments && workshop.comments.length > 0 ? `
                                    <div class="mt-4">
                                        <h4 class="font-medium text-gray-700 mb-2">Recent Comments:</h4>
                                        <div class="space-y-2">
                                            ${workshop.comments.slice(0, 2).map(comment => `
                                                <div class="bg-gray-50 p-3 rounded-lg">
                                                    <div class="flex items-center justify-between">
                                                        <div class="font-medium">${comment.userName}</div>
                                                        <div class="flex stars-container">
                                                            ${comment.rating ? renderStars(comment.rating) : ''}
                                                        </div>
                                                    </div>
                                                    <div class="text-gray-600 mt-1">${comment.text}</div>
                                                </div>
                                            `).join('')}
                                            ${workshop.comments.length > 2 ? `
                                                <div class="text-blue-600 text-sm cursor-pointer view-all-comments" data-id="${workshopId}">
                                                    View all ${workshop.comments.length} comments
                                                </div>
                                            ` : ''}
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }


                    workshopCard.innerHTML = `
                        <div class="workshop-content cursor-pointer" data-id="${workshopId}">
                            <h2 class="text-2xl font-bold text-gray-800 mb-4 hover:text-indigo-600 transition">${workshop.title}</h2>
                            <div class="space-y-2 text-gray-600">
                                <p><strong>Date:</strong> ${formattedDate}</p>
                                <p><strong>Location:</strong> ${workshop.location}</p>
                                <p><strong>Status:</strong> <span class="font-semibold ${getStatusColor(workshop.status)}">${workshop.status}</span></p>
                                <p><strong>Capacity:</strong> ${workshop.capacity}</p>
                                <p><strong>Registered:</strong> ${workshop.registered || 0}</p>
                            </div>
                            ${ratingSection}
                        </div>
                        ${status !== 'completed' ? `
                            <button class="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg transition-colors w-full sm:w-auto register-btn" 
                                    data-id="${workshopId}" 
                                    id="btn-${workshopId}">
                                ${isRegistered ? 'Contact Us' : 'Register Now'}
                            </button>
                        ` : ''}
                    `;

                    workshopsList.appendChild(workshopCard);
                });
            }
        });

                function showRatingPopup(workshopId, workshopData) {
                    const popupContainer = document.createElement('div');
                    popupContainer.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
                    popupContainer.innerHTML = `
                        <div class="bg-white rounded-lg shadow-xl max-w-md w-full">
                            <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                                <h2 class="text-xl font-bold text-gray-800">Rate ${workshopData.title}</h2>
                                <button class="text-gray-500 hover:text-gray-700 close-rating">
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div class="p-6">
                                <div class="mb-6">
                                    <h3 class="text-lg font-medium mb-3 text-center">How would you rate this workshop?</h3>
                                    <div class="flex justify-center space-x-1 mb-2" id="rating-stars">
                                        ${[1, 2, 3, 4, 5].map(i => `
                                            <svg class="w-10 h-10 cursor-pointer star" data-rating="${i}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                            </svg>
                                        `).join('')}
                                    </div>
                                    <div class="text-center text-sm font-medium text-gray-700" id="rating-text">Select your rating</div>
                                </div>
                                
                                <div class="mb-6">
                                    <h3 class="text-lg font-medium mb-2">Share your experience (optional)</h3>
                                    <textarea id="rating-comment" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" rows="4" placeholder="What did you like about this workshop?"></textarea>
                                </div>
                                
                                <button id="submit-rating" class="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors">
                                    Submit Review
                                </button>
                            </div>
                        </div>
                    `;
                    
                    document.body.appendChild(popupContainer);
                    
                    let selectedRating = 0;
                    
                    // Star hover and click functionality
                    popupContainer.querySelectorAll('.star').forEach(star => {
                        star.addEventListener('mouseover', (e) => {
                            const rating = parseInt(star.getAttribute('data-rating'));
                            highlightStars(rating);
                            updateRatingText(rating);
                        });
                        
                        star.addEventListener('click', (e) => {
                            selectedRating = parseInt(star.getAttribute('data-rating'));
                            highlightStars(selectedRating);
                            updateRatingText(selectedRating);
                        });
                    });
                    
                    // Reset stars when mouse leaves the container
                    popupContainer.querySelector('#rating-stars').addEventListener('mouseleave', () => {
                        highlightStars(selectedRating);
                        updateRatingText(selectedRating);
                    });
                    
                    // Close button
                    popupContainer.querySelector('.close-rating').addEventListener('click', () => {
                        document.body.removeChild(popupContainer);
                    });
                    
                    // Submit rating
                    popupContainer.querySelector('#submit-rating').addEventListener('click', async () => {
                        if (selectedRating === 0) {
                            alert('Please select a rating');
                            return;
                        }

                        const comment = popupContainer.querySelector('#rating-comment').value.trim();
                        const user = auth.currentUser;
                        
                        if (!user) {
                            alert('Please log in to submit a review');
                            return;
                        }

                        try {
                            // Create the rating data object
                            const ratingData = {
                                rating: selectedRating,
                                userName: user.displayName || 'Anonymous',
                                timestamp: firebase.firestore.FieldValue.serverTimestamp()
                            };

                            // Add comment if provided
                            if (comment) {
                                ratingData.comment = comment;
                            }

                            // Update the workshop document
                            await db.collection('workshops').doc(workshopId).update({
                                [`ratings.${user.uid}`]: ratingData
                            });

                            // Also add to comments array if comment exists
                            if (comment) {
                                await db.collection('workshops').doc(workshopId).update({
                                    comments: firebase.firestore.FieldValue.arrayUnion({
                                        text: comment,
                                        rating: selectedRating,
                                        userName: user.displayName || 'Anonymous',
                                        timestamp: firebase.firestore.FieldValue.serverTimestamp()
                                    })
                                });
                            }

                            // Close popup and refresh
                            document.body.removeChild(popupContainer);
                            loadWorkshops();
                        } catch (error) {
                            console.error("Error submitting rating:", error);
                            
                            // More detailed error message
                            let errorMessage = 'There was an error submitting your review.';
                            if (error.code === 'permission-denied') {
                                errorMessage = 'You need proper permissions to submit a review.';
                            } else if (error.code === 'unavailable') {
                                errorMessage = 'Network error. Please check your connection.';
                            }
                            
                            alert(errorMessage);
                        }
                    });
                    
                    function highlightStars(rating) {
                        popupContainer.querySelectorAll('.star').forEach((star, index) => {
                            const starRating = index + 1;
                            if (starRating <= rating) {
                                star.classList.add('text-yellow-400', 'fill-current');
                                star.classList.remove('text-gray-300');
                            } else {
                                star.classList.remove('text-yellow-400', 'fill-current');
                                star.classList.add('text-gray-300');
                            }
                        });
                    }
                    
                    function updateRatingText(rating) {
                        const texts = [
                            'Select your rating',
                            'Poor - Not satisfied',
                            'Fair - Could be better',
                            'Good - Satisfied',
                            'Very Good - Great experience',
                            'Excellent - Above expectations'
                        ];
                        popupContainer.querySelector('#rating-text').textContent = texts[rating];
                    }
                }


        // Attach event handlers
        if (!workshopClickHandlerAttached) {
            attachWorkshopClickHandlers();
            workshopClickHandlerAttached = true;
        }

        // Add event listeners to register buttons
        document.querySelectorAll('.register-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const workshopId = button.getAttribute('data-id');
                const workshopDoc = await db.collection('workshops').doc(workshopId).get();
                const workshopData = workshopDoc.data();
                
                if (button.textContent.trim() === 'Contact Us') {
                    window.location.href = 'contact.html';
                    return;
                }
                
                const user = auth.currentUser;
                
                if (user) {
                    await registerForWorkshop(user, workshopId, workshopData);
                    showSuccessPopup(workshopData);
                    button.textContent = 'Contact Us';
                } else {
                    showRegistrationForm(workshopId, workshopData, () => {
                        showSuccessPopup(workshopData);
                        document.querySelector(`#btn-${workshopId}`).textContent = 'Contact Us';
                    });
                }
            });
        });

        // Add event listeners to star ratings
        document.querySelectorAll('.star').forEach(star => {
            star.addEventListener('click', async (e) => {
                e.stopPropagation();
                const rating = parseInt(star.getAttribute('data-rating'));
                const workshopId = star.closest('.rating-stars').getAttribute('data-id');
                await rateWorkshop(workshopId, rating);
            });
        });

        // Add event listeners to view all comments
        document.querySelectorAll('.view-all-comments').forEach(link => {
            link.addEventListener('click', async (e) => {
                e.stopPropagation();
                const workshopId = link.getAttribute('data-id');
                const workshopDoc = await db.collection('workshops').doc(workshopId).get();
                showCommentsPopup(workshopId, workshopDoc.data());
            });
        });

        document.querySelectorAll('.rate-workshop-btn').forEach(button => {
            button.addEventListener('click', async (e) => {
                e.stopPropagation();
                const workshopId = button.getAttribute('data-id');
                const workshopDoc = await db.collection('workshops').doc(workshopId).get();
                showRatingPopup(workshopId, workshopDoc.data());
            });
        });

    } catch (error) {
        console.error("Error loading workshops: ", error);
        workshopsList.innerHTML = `<p class="text-red-500 text-center">Error loading workshops: ${error.message}</p>`;
    }
}

// Helper function to render stars
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<svg class="w-5 h-5 ${i <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>`;
    }
    return stars;
}

// Calculate average rating
function calculateAverageRating(ratings) {
    const values = Object.values(ratings).map(r => r.rating);
    return values.reduce((sum, rating) => sum + rating, 0) / values.length;
}

// Rate a workshop
async function rateWorkshop(workshopId, rating) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        await db.collection('workshops').doc(workshopId).update({
            [`ratings.${user.uid}`]: {
                rating: rating,
                userName: user.displayName || 'Anonymous',
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            }
        });
        
        // Refresh the workshop display
        loadWorkshops();
    } catch (error) {
        console.error("Error rating workshop: ", error);
        alert('There was an error submitting your rating. Please try again.');
    }
}

// Show all comments popup
function showCommentsPopup(workshopId, workshopData) {
    const popupContainer = document.createElement('div');
    popupContainer.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    popupContainer.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-800">Comments for ${workshopData.title}</h2>
                <button class="text-gray-500 hover:text-gray-700 close-comments">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="p-6">
                ${workshopData.comments && workshopData.comments.length > 0 ? `
                    <div class="space-y-4">
                        ${workshopData.comments.map(comment => `
                            <div class="border-b border-gray-100 pb-4 last:border-0">
                                <div class="flex justify-between items-start">
                                    <div class="font-medium">${comment.userName}</div>
                                    <div class="text-sm text-gray-500">${new Date(comment.timestamp?.seconds * 1000).toLocaleString()}</div>
                                </div>
                                <div class="mt-1 text-gray-600">${comment.text}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-gray-500 text-center py-8">No comments yet.</p>'}
                
                <div class="mt-8">
                    <h3 class="text-lg font-semibold mb-4">Add your comment</h3>
                    <textarea id="comment-text" class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" rows="3" placeholder="Share your thoughts about this workshop..."></textarea>
                    <button id="submit-comment" class="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors">
                        Submit Comment
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(popupContainer);
    
    // Close button
    popupContainer.querySelector('.close-comments').addEventListener('click', () => {
        document.body.removeChild(popupContainer);
    });
    
    // Submit comment
    popupContainer.querySelector('#submit-comment').addEventListener('click', async () => {
        const commentText = popupContainer.querySelector('#comment-text').value.trim();
        if (!commentText) return;
        
        const user = auth.currentUser;
        if (!user) {
            alert('Please log in to comment');
            return;
        }
        
        try {
            await db.collection('workshops').doc(workshopId).update({
                comments: firebase.firestore.FieldValue.arrayUnion({
                    text: commentText,
                    userName: user.displayName || 'Anonymous',
                    timestamp: firebase.firestore.FieldValue.serverTimestamp()
                })
            });
            
            // Refresh the workshop display
            loadWorkshops();
            document.body.removeChild(popupContainer);
        } catch (error) {
            console.error("Error submitting comment: ", error);
            alert('There was an error submitting your comment. Please try again.');
        }
    });
}

function attachWorkshopClickHandlers() {
    // Use event delegation instead of attaching to each card
    document.getElementById('workshops-list').addEventListener('click', async (e) => {
        // Find the closest workshop-content element
        const workshopContent = e.target.closest('.workshop-content');
        
        if (workshopContent && !e.target.closest('.register-btn')) {
            const workshopId = workshopContent.getAttribute('data-id');
            const workshopDoc = await db.collection('workshops').doc(workshopId).get();
            const workshopData = workshopDoc.data();
            showWorkshopDetails(workshopId, workshopData);
        }
    });
}

let currentDetailsPopup = null;

function showWorkshopDetails(workshopId, workshopData) {
    // Close any existing popup
    if (currentDetailsPopup) {
        currentDetailsPopup.remove();
        currentDetailsPopup = null;
    }

    const date = workshopData.date.toDate();
    const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const detailsPopup = document.createElement('div');
    detailsPopup.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    detailsPopup.innerHTML = `
        <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div class="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center">
                <h2 class="text-2xl font-bold text-gray-800">${workshopData.title}</h2>
                <button class="text-gray-500 hover:text-gray-700 close-details">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            
            <div class="p-6 space-y-6">
                <!-- Basic Info -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-gray-700 mb-2">Date & Time</h3>
                        <p>${formattedDate}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-gray-700 mb-2">Location</h3>
                        <p>${workshopData.location}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-gray-700 mb-2">Status</h3>
                        <p class="${getStatusColor(workshopData.status)}">${workshopData.status}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h3 class="font-semibold text-gray-700 mb-2">Capacity</h3>
                        <p>${workshopData.registered || 0} / ${workshopData.capacity}</p>
                    </div>
                </div>
                
                <!-- Description -->
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Description</h3>
                    <p class="text-gray-600">${workshopData.description || 'No description available.'}</p>
                </div>
                
                <!-- Video (if available) -->
                ${workshopData.videoUrl ? `
                <div>
                    <h3 class="text-xl font-semibold text-gray-800 mb-2">Workshop Video</h3>
                    <div class="aspect-w-16 aspect-h-9">
                        <video src="${workshopData.videoUrl}" controls class="w-full rounded-lg"></video>
                    </div>
                </div>
                ` : ''}
                
                <!-- Module Details -->
                <div class="space-y-6">
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Module Description</h3>
                        <div class="prose max-w-none text-gray-600">
                            ${workshopData.moduleDescription || 'No module description available.'}
                        </div>
                    </div>
                    
                    <div>
                        <h3 class="text-xl font-semibold text-gray-800 mb-2">Learning Objectives</h3>
                        <div class="prose max-w-none text-gray-600">
                            ${workshopData.moduleObjectives || 'No learning objectives provided.'}
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">Prerequisites</h3>
                            <div class="prose max-w-none text-gray-600">
                                ${workshopData.modulePrerequisites || 'No prerequisites required.'}
                            </div>
                        </div>
                        <div>
                            <h3 class="text-xl font-semibold text-gray-800 mb-2">Required Materials</h3>
                            <div class="prose max-w-none text-gray-600">
                                ${workshopData.moduleMaterials || 'No special materials required.'}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer with Register Button -->
            <div class="sticky bottom-0 bg-white border-t border-gray-200 p-4">
                <button class="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg transition register-btn" 
                        data-id="${workshopId}">
                    ${auth.currentUser ? 'Contact Us' : 'Register Now'}
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(detailsPopup);
    currentDetailsPopup = detailsPopup;
    
    // Add single event listener for closing
    detailsPopup.querySelector('.close-details').addEventListener('click', () => {
        detailsPopup.remove();
        currentDetailsPopup = null;
    });
    
    // Close when clicking outside
    detailsPopup.addEventListener('click', (e) => {
        if (e.target === detailsPopup) {
            detailsPopup.remove();
            currentDetailsPopup = null;
        }
    });
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

function showRegistrationForm(workshopId, workshopData, successCallback) {
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
                            <label for="registerAge" class="block text-sm font-medium text-gray-700 mb-1">Age</label>
                            <input type="number" id="registerAge" required min="13" max="100"
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                        </div>
                        <div>
                            <label for="registerOccupation" class="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                            <select id="registerOccupation" required
                                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition">
                                <option value="">Select your occupation</option>
                                <option value="student">Student</option>
                                <option value="employed">Employed</option>
                                <option value="unemployed">Unemployed</option>
                                <option value="other">Other</option>
                            </select>
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
        const age = form.querySelector('#registerAge').value;
        const occupation = form.querySelector('#registerOccupation').value;
        const workshopId = form.querySelector('#workshopId').value;
        
        // Basic validation
        if (!name || !email || !password || !phone || !age || !occupation) {
            document.getElementById('error-message').textContent = 'Please fill in all fields';
            return;
        }
        
        // Phone validation (Philippine format)
        const phoneRegex = /^(09|\+639)\d{9}$/;
        if (!phoneRegex.test(phone)) {
            document.getElementById('error-message').textContent = 'Please enter a valid Philippine phone number (e.g., 09123456789)';
            return;
        }
        
        // Age validation
        if (age < 13 || age > 100) {
            document.getElementById('error-message').textContent = 'Please enter a valid age between 13 and 100';
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
                age: age,
                occupation: occupation,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            // Register for workshop
            await registerForWorkshop(user, workshopId);
            
            // Close the registration popup
            document.body.removeChild(popupContainer);
            
            // Show success popup
            showSuccessPopup(workshopData);
            
            // Execute success callback if provided
            if (successCallback) {
                successCallback();
            }
            
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