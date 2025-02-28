// Check if user is admin
document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(async user => {
        if (user) {
            try {
                const userDoc = await db.collection('users').doc(user.uid).get();
                const userData = userDoc.data();
                
                if (!userData || userData.role !== 'admin') {
                    // Not an admin, redirect to home
                    window.location.href = '../index.html';
                } else {
                    // Is admin, load dashboard data
                    document.getElementById('admin-name').textContent = userData.fullName || user.displayName;
                    loadDashboardData();
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                window.location.href = '../index.html';
            }
        } else {
            // Not logged in, redirect to login
            window.location.href = '../login.html';
        }
    });

    // Set current date
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('current-date').textContent = today.toLocaleDateString('en-US', options);

    // Logout Button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});

// Load dashboard data
async function loadDashboardData() {
    try {
        // Get total users count
        const usersSnapshot = await db.collection('users').get();
        const totalUsers = usersSnapshot.size;
        document.getElementById('total-users').textContent = totalUsers;

        // Get customers (exclude admins)
        const customersSnapshot = await db.collection('users').where('role', '==', 'customer').get();
        const customers = customersSnapshot.docs;

        // Get recent registrations
        const recentUsers = customers
            .sort((a, b) => b.data().createdAt - a.data().createdAt)
            .slice(0, 5);
        
        // Populate recent users table
        const recentUsersBody = document.getElementById('recent-users-body');
        recentUsersBody.innerHTML = '';
        
        recentUsers.forEach(user => {
            const userData = user.data();
            const row = document.createElement('tr');
            
            const createdDate = userData.createdAt ? 
                userData.createdAt.toDate().toLocaleDateString() : 'N/A';
            
            row.innerHTML = `
                <td>${userData.fullName}</td>
                <td>${userData.email}</td>
                <td>${createdDate}</td>
                <td>
                    <button class="view-btn" data-id="${user.id}">View</button>
                </td>
            `;
            
            recentUsersBody.appendChild(row);
        });

        // Get new registrations (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const newRegistrations = customers.filter(user => {
            if (!user.data().createdAt) return false;
            return user.data().createdAt.toDate() > oneWeekAgo;
        }).length;
        
        document.getElementById('new-registrations').textContent = newRegistrations;

        // Get workshops data
        const workshopsSnapshot = await db.collection('workshops').get();
        const workshops = workshopsSnapshot.docs;
        
        // Count active workshops
        const activeWorkshops = workshops.filter(workshop => {
            const workshopData = workshop.data();
            if (!workshopData.date) return false;
            return new Date(workshopData.date) >= new Date();
        }).length;
        
        document.getElementById('active-workshops').textContent = activeWorkshops;
        
        // Count upcoming events
        const upcomingEvents = workshops.filter(workshop => {
            const workshopData = workshop.data();
            if (!workshopData.date) return false;
            const workshopDate = new Date(workshopData.date);
            const today = new Date();
            const oneMonthLater = new Date();
            oneMonthLater.setMonth(today.getMonth() + 1);
            
            return workshopDate >= today && workshopDate <= oneMonthLater;
        }).length;
        
        document.getElementById('upcoming-events').textContent = upcomingEvents;
        
        // Populate upcoming workshops table
        const upcomingWorkshops = workshops
            .filter(workshop => {
                const workshopData = workshop.data();
                if (!workshopData.date) return false;
                return new Date(workshopData.date) >= new Date();
            })
            .sort((a, b) => {
                return new Date(a.data().date) - new Date(b.data().date);
            })
            .slice(0, 5);
        
        const upcomingWorkshopsBody = document.getElementById('upcoming-workshops-body');
        upcomingWorkshopsBody.innerHTML = '';
        
        upcomingWorkshops.forEach(workshop => {
            const workshopData = workshop.data();
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${workshopData.title}</td>
                <td>${new Date(workshopData.date).toLocaleDateString()}</td>
                <td>${workshopData.registrations || 0}</td>
                <td>
                    <button class="edit-btn" data-id="${workshop.id}">Edit</button>
                </td>
            `;
            
            upcomingWorkshopsBody.appendChild(row);
        });
        
        // Add event listeners for view buttons
        document.querySelectorAll('.view-btn').forEach(button => {
            button.addEventListener('click', () => {
                const userId = button.getAttribute('data-id');
                window.location.href = `users.html?id=${userId}`;
            });
        });
        
        // Add event listeners for edit buttons
        document.querySelectorAll('.edit-btn').forEach(button => {
            button.addEventListener('click', () => {
                const workshopId = button.getAttribute('data-id');
                window.location.href = `workshops.html?id=${workshopId}`;
            });
        });
    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

// Handle User Logout
function handleLogout(e) {
    e.preventDefault();
    
    auth.signOut()
        .then(() => {
            window.location.href = '../index.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
}