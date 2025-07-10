// Function to load and display real-time dashboard data
function loadDashboardData() {
    const db = firebase.firestore();
    const totalUsersElement = document.getElementById('totalUsers');
    const activeWorkshopsElement = document.getElementById('activeWorkshops');
    const totalRegistrationsElement = document.getElementById('totalRegistrations');
    const recentActivityElement = document.getElementById('recentActivity');
    const clearActivityBtn = document.getElementById('clearActivityBtn');
    
    // Initialize with loading indicators
    totalUsersElement.textContent = 'Loading...';
    activeWorkshopsElement.textContent = 'Loading...';
    totalRegistrationsElement.textContent = 'Loading...';
    
    // Get total users count
    db.collection('users').get().then((snapshot) => {
        totalUsersElement.textContent = snapshot.size;
    }).catch((error) => {
        console.error("Error getting users: ", error);
        totalUsersElement.textContent = 'Error';
    });
    
    // Get active workshops count
    db.collection('workshops')
        .where('status', '==', 'active')
        .get()
        .then((snapshot) => {
            activeWorkshopsElement.textContent = snapshot.size;
        }).catch((error) => {
            console.error("Error getting workshops: ", error);
            activeWorkshopsElement.textContent = 'Error';
        });
    
    // Get total registrations count
    db.collection('registrations').get().then((snapshot) => {
        totalRegistrationsElement.textContent = snapshot.size;
    }).catch((error) => {
        console.error("Error getting registrations: ", error);
        totalRegistrationsElement.textContent = 'Error';
    });
    
    // Set up real-time listener for recent activity
    const activityListener = db.collection('activity')
        .orderBy('timestamp', 'desc')
        .limit(20)
        .onSnapshot((snapshot) => {
            // Clear current activity
            recentActivityElement.innerHTML = '';
            
            if (snapshot.empty) {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td colspan="4" class="py-4 px-4 text-center text-gray-500">No recent activity</td>
                `;
                recentActivityElement.appendChild(row);
                return;
            }
            
            snapshot.forEach((doc) => {
                const activity = doc.data();
                const date = new Date(activity.timestamp?.toDate() || new Date());
                const formattedDate = new Intl.DateTimeFormat('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                }).format(date);
                
                // Determine activity type color
                let typeColor = 'text-gray-600';
                switch(activity.type?.toLowerCase()) {
                    case 'login':
                        typeColor = 'text-blue-600';
                        break;
                    case 'registration':
                        typeColor = 'text-green-600';
                        break;
                    case 'workshop created':
                        typeColor = 'text-purple-600';
                        break;
                    case 'profile updated':
                        typeColor = 'text-orange-600';
                        break;
                }
                
                const row = document.createElement('tr');
                row.className = 'hover:bg-gray-50 transition-colors duration-150';
                row.innerHTML = `
                    <td class="py-2 px-4 border-b ${typeColor} font-medium">${activity.type || 'Unknown'}</td>
                    <td class="py-2 px-4 border-b">${activity.user || 'Unknown'}</td>
                    <td class="py-2 px-4 border-b text-gray-600">${formattedDate}</td>
                    <td class="py-2 px-4 border-b">${activity.details || 'No details'}</td>
                `;
                
                recentActivityElement.appendChild(row);
            });
        }, (error) => {
            console.error("Error getting activities: ", error);
            recentActivityElement.innerHTML = `
                <tr>
                    <td colspan="4" class="py-4 px-4 text-center">
                        <div class="text-red-500 font-medium">Error loading activities</div>
                        <div class="text-sm text-gray-500 mt-1">${error.message}</div>
                    </td>
                </tr>
            `;
        });
    
    // Set up real-time listeners for stat updates
    db.collection('users').onSnapshot((snapshot) => {
        totalUsersElement.textContent = snapshot.size;
    }, (error) => {
        console.error("Error in users listener: ", error);
    });
    
    db.collection('workshops')
        .where('status', '==', 'active')
        .onSnapshot((snapshot) => {
            activeWorkshopsElement.textContent = snapshot.size;
        }, (error) => {
            console.error("Error in workshops listener: ", error);
        });
    
    db.collection('registrations').onSnapshot((snapshot) => {
        totalRegistrationsElement.textContent = snapshot.size;
    }, (error) => {
        console.error("Error in registrations listener: ", error);
    });
    
    // Setup clear activity button
    clearActivityBtn.addEventListener('click', clearActivityHistory);
}

// Function to clear activity history
function clearActivityHistory() {
    if (!confirm('Are you sure you want to clear all activity history? This action cannot be undone.')) {
        return;
    }
    
    const db = firebase.firestore();
    
    // Get all activity documents
    db.collection('activity').get()
        .then((snapshot) => {
            // Create a batch to delete all documents
            const batch = db.batch();
            snapshot.forEach((doc) => {
                batch.delete(doc.ref);
            });
            
            // Commit the batch delete
            return batch.commit();
        })
        .then(() => {
            alert('Activity history has been cleared successfully.');
        })
        .catch((error) => {
            console.error("Error clearing activity history:", error);
            alert(`Error clearing activity history: ${error.message}`);
        });
}

// Function to log admin activity
function logAdminActivity(type, details) {
    const db = firebase.firestore();
    const auth = firebase.auth();
    
    const user = auth.currentUser;
    if (!user) return Promise.reject(new Error("No user logged in"));
    
    return db.collection('activity').add({
        type: type,
        user: user.email,
        details: details,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        userId: user.uid
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

// Utility function to create dummy data for testing
// Only use this in development
function createDummyData() {
    const db = firebase.firestore();
    const batch = db.batch();
    
    // Create dummy users
    for (let i = 1; i <= 10; i++) {
        const userRef = db.collection('users').doc(`dummy-user-${i}`);
        batch.set(userRef, {
            name: `Test User ${i}`,
            email: `test${i}@example.com`,
            role: i === 1 ? 'admin' : 'user',
            created: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    // Create dummy workshops
    const statuses = ['active', 'upcoming', 'completed'];
    for (let i = 1; i <= 15; i++) {
        const workshopRef = db.collection('workshops').doc(`dummy-workshop-${i}`);
        batch.set(workshopRef, {
            title: `Test Workshop ${i}`,
            description: `This is a test workshop ${i}`,
            status: statuses[i % statuses.length],
            capacity: 20,
            registered: Math.floor(Math.random() * 20),
            date: new Date(Date.now() + (i * 86400000)), // Add i days to current date
            created: firebase.firestore.FieldValue.serverTimestamp()
        });
    }
    
    // Create dummy registrations
    for (let i = 1; i <= 30; i++) {
        const registrationRef = db.collection('registrations').doc(`dummy-reg-${i}`);
        batch.set(registrationRef, {
            userId: `dummy-user-${Math.ceil(Math.random() * 10)}`,
            workshopId: `dummy-workshop-${Math.ceil(Math.random() * 15)}`,
            status: 'confirmed',
            timestamp: new Date(Date.now() - (Math.random() * 7 * 86400000)) // Random date in last week
        });
    }
    
    // Create dummy activity
    const actionTypes = ['Login', 'Registration', 'Workshop Created', 'Profile Updated'];
    for (let i = 1; i <= 20; i++) {
        const activityRef = db.collection('activity').doc(`dummy-activity-${i}`);
        const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
        let details = '';
        
        switch(actionType) {
            case 'Login':
                details = 'User logged into the system';
                break;
            case 'Registration':
                details = `Registered for Workshop ${Math.ceil(Math.random() * 15)}`;
                break;
            case 'Workshop Created':
                details = `Created new workshop: Workshop Title ${i}`;
                break;
            case 'Profile Updated':
                details = 'Updated user profile information';
                break;
        }
        
        batch.set(activityRef, {
            type: actionType,
            user: `test${Math.ceil(Math.random() * 10)}@example.com`,
            details: details,
            timestamp: new Date(Date.now() - (Math.random() * 3 * 86400000)) // Random date in last 3 days
        });
    }
    
    // Commit the batch
    return batch.commit()
        .then(() => {
            console.log("Dummy data created successfully");
            return true;
        })
        .catch((error) => {
            console.error("Error creating dummy data: ", error);
            return false;
        });
}

// Uncomment this line during development to populate with test data
// You should only run this once, then comment it out again
// document.addEventListener('DOMContentLoaded', () => setTimeout(createDummyData, 2000));
// bahala ni Batman haan  kon ammo aramidek
// kaya ni Claude ken Cursor dayta HAHAHAHAH

// Function to recalculate analytics
async function recalculateAnalytics() {
    try {
        const analyticsRef = db.collection('analytics').doc('workshopStats');
        const workshopsSnapshot = await db.collection('workshops').get();
        let totalRegs = 0;
        
        workshopsSnapshot.forEach(workshopDoc => {
            const workshop = workshopDoc.data();
            if (workshop.registeredUsers) {
                totalRegs += workshop.registeredUsers.length;
            }
        });
        
        await analyticsRef.set({
            totalRegistrations: totalRegs,
            lastUpdated: new Date()
        }, { merge: true });
        
        alert('Analytics recalculated successfully! Total registrations: ' + totalRegs);
    } catch (error) {
        console.error('Error recalculating analytics:', error);
        alert('Error recalculating analytics. Check console for details.');
    }
}

// Add recalculate button to the page
document.addEventListener('DOMContentLoaded', function() {
    const totalRegistrationsDiv = document.querySelector('.text-purple-500').parentElement;
    const recalculateButton = document.createElement('button');
    recalculateButton.className = 'mt-2 text-sm bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded';
    recalculateButton.textContent = 'Recalculate';
    recalculateButton.onclick = recalculateAnalytics;
    totalRegistrationsDiv.appendChild(recalculateButton);
});
