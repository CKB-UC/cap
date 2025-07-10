// Global variables
let currentUser;
let selectedTimeRange = 7; // Default to 7 days

// Function to load analytics data
function loadAnalyticsData() {
    // Get current user
    currentUser = auth.currentUser;
    
    // Get selected time range
    selectedTimeRange = document.getElementById('timeRange').value;
    
    // Calculate the start date based on the selected time range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - parseInt(selectedTimeRange));
    
    // Show loading indicators
    showLoadingState();
    
    // Fetch data from Firestore
    fetchOverviewMetrics(startDate, endDate);
    fetchRegistrationTrends(startDate, endDate);
    fetchWorkshopPopularity();
    fetchUserDemographics();
    fetchCompletionStats();
    fetchTopWorkshops();
}

// Show loading state for dashboard elements
function showLoadingState() {
    document.getElementById('registrationRate').textContent = "Loading...";
    document.getElementById('completionRate').textContent = "Loading...";
    document.getElementById('userGrowth').textContent = "Loading...";
    document.getElementById('popularTime').textContent = "Loading...";
    
    document.getElementById('topWorkshops').innerHTML = `
        <tr>
            <td colspan="5" class="py-4 px-4 text-center text-gray-500">Loading workshop data...</td>
        </tr>
    `;
}

// Fetch overview metrics for the dashboard cards
function fetchOverviewMetrics(startDate, endDate) {
    // Get workshops and their registrations
    db.collection('workshops').get()
        .then((workshopSnapshot) => {
            let totalRegistrations = 0;
            let activeWorkshops = 0;
            
            // Count total registrations and active workshops
            workshopSnapshot.forEach(doc => {
                const workshop = doc.data();
                if (workshop.registeredUsers) {
                    totalRegistrations += workshop.registeredUsers.length;
                }
                if (workshop.status === 'active') {
                    activeWorkshops++;
                }
            });
            
            // Calculate average registrations per workshop
            const avgRegistrations = activeWorkshops > 0 ? 
                (totalRegistrations / activeWorkshops).toFixed(1) : 0;
            
            document.getElementById('registrationRate').textContent = avgRegistrations;
            
            // Get completions
            db.collection('completions')
                .where('timestamp', '>=', startDate)
                .where('timestamp', '<=', endDate)
                .get()
                .then((completionSnapshot) => {
                    // Calculate completion rate
                    const completionRate = totalRegistrations > 0 ? 
                        ((completionSnapshot.size / totalRegistrations) * 100).toFixed(1) + '%' : '0%';
                    
                    document.getElementById('completionRate').textContent = completionRate;
                });
            
            // Get user growth
            db.collection('users')
                .where('createdAt', '>=', startDate)
                .where('createdAt', '<=', endDate)
                .get()
                .then((userSnapshot) => {
                    document.getElementById('userGrowth').textContent = userSnapshot.size;
                });
            
            // Get popular time (simplified for demo)
            document.getElementById('popularTime').textContent = "2PM - 6PM";
        })
        .catch((error) => {
            console.error("Error fetching overview metrics:", error);
            document.getElementById('registrationRate').textContent = 'Error';
            document.getElementById('completionRate').textContent = 'Error';
            document.getElementById('userGrowth').textContent = 'Error';
        });
}

// Fetch registration trends data for the line chart
function fetchRegistrationTrends(startDate, endDate) {
    // Prepare date labels based on time range
    const labels = [];
    const registrationsData = [];
    const completionsData = [];
    
    // Create date labels (simplified version for demo)
    const format = { month: 'short', day: 'numeric' };
    const days = parseInt(selectedTimeRange);
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', format));
        // Initialize with zeros
        registrationsData.push(0);
        completionsData.push(0);
    }
    
    // Get registrations grouped by day
    db.collection('registrations')
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .get()
        .then((snapshot) => {
            // Process registrations
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.timestamp) {
                    const registrationDate = data.timestamp.toDate();
                    const dayDiff = Math.floor((endDate - registrationDate) / (1000 * 60 * 60 * 24));
                    if (dayDiff >= 0 && dayDiff < days) {
                        registrationsData[days - 1 - dayDiff]++;
                    }
                }
            });
            
            // Get completions grouped by day
            db.collection('completions')
                .where('timestamp', '>=', startDate)
                .where('timestamp', '<=', endDate)
                .get()
                .then((compSnapshot) => {
                    // Process completions
                    compSnapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.timestamp) {
                            const completionDate = data.timestamp.toDate();
                            const dayDiff = Math.floor((endDate - completionDate) / (1000 * 60 * 60 * 24));
                            if (dayDiff >= 0 && dayDiff < days) {
                                completionsData[days - 1 - dayDiff]++;
                            }
                        }
                    });
                    
                    // Render the chart
                    renderRegistrationTrendsChart(labels, registrationsData, completionsData);
                });
        })
        .catch((error) => {
            console.error("Error fetching registration trends:", error);
        });
}

// Render the registration trends chart
function renderRegistrationTrendsChart(labels, registrationsData, completionsData) {
    const ctx = document.getElementById('registrationTrendsChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.registrationChart) {
        window.registrationChart.destroy();
    }
    
    window.registrationChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Registrations',
                    data: registrationsData,
                    borderColor: 'rgba(59, 130, 246, 1)', // Blue
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Completions',
                    data: completionsData,
                    borderColor: 'rgba(16, 185, 129, 1)', // Green
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                tooltip: {
                    mode: 'index',
                    intersect: false
                },
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Fetch workshop popularity data for the bar chart
function fetchWorkshopPopularity() {
    db.collection('workshops')
        .orderBy('registrationCount', 'desc')
        .limit(10)
        .get()
        .then((snapshot) => {
            const labels = [];
            const registrationData = [];
            const completionData = [];
            
            snapshot.forEach(doc => {
                const workshop = doc.data();
                labels.push(workshop.title.length > 15 ? 
                    workshop.title.substring(0, 15) + '...' : workshop.title);
                registrationData.push(workshop.registrationCount || 0);
                completionData.push(workshop.completionCount || 0);
            });
            
            renderWorkshopPopularityChart(labels, registrationData, completionData);
        })
        .catch((error) => {
            console.error("Error fetching workshop popularity:", error);
        });
}

// Render the workshop popularity chart
function renderWorkshopPopularityChart(labels, registrationData, completionData) {
    const ctx = document.getElementById('workshopPopularityChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.popularityChart) {
        window.popularityChart.destroy();
    }
    
    window.popularityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Registrations',
                    data: registrationData,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Completions',
                    data: completionData,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)', // Green
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

// Fetch user demographics data for the pie chart
function fetchUserDemographics() {
    db.collection('users')
        .get()
        .then((snapshot) => {
            // Initialize counters for demographics
            const roles = {
                'student': 0,
                'professional': 0,
                'educator': 0,
                'other': 0
            };
            
            // Count users by role
            snapshot.forEach(doc => {
                const user = doc.data();
                if (user.role && roles.hasOwnProperty(user.role)) {
                    roles[user.role]++;
                } else {
                    roles['other']++;
                }
            });
            
            renderUserDemographicsChart(roles);
        })
        .catch((error) => {
            console.error("Error fetching user demographics:", error);
        });
}

// Render the user demographics chart
function renderUserDemographicsChart(roleData) {
    const ctx = document.getElementById('userDemographicsChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.demographicsChart) {
        window.demographicsChart.destroy();
    }
    
    window.demographicsChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(roleData).map(role => 
                role.charAt(0).toUpperCase() + role.slice(1)
            ),
            datasets: [{
                data: Object.values(roleData),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)', // Blue
                    'rgba(16, 185, 129, 0.7)', // Green
                    'rgba(139, 92, 246, 0.7)', // Purple
                    'rgba(249, 115, 22, 0.7)' // Orange
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(139, 92, 246, 1)',
                    'rgba(249, 115, 22, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Fetch completion stats for the doughnut chart
function fetchCompletionStats() {
    db.collection('workshops')
        .get()
        .then((snapshot) => {
            let completed = 0;
            let inProgress = 0;
            let abandoned = 0;
            
            const promises = snapshot.docs.map(doc => {
                const workshop = doc.data();
                
                // For each workshop, get registration and completion counts
                return db.collection('registrations')
                    .where('workshopId', '==', doc.id)
                    .get()
                    .then((regSnapshot) => {
                        const regCount = regSnapshot.size;
                        
                        return db.collection('completions')
                            .where('workshopId', '==', doc.id)
                            .get()
                            .then((compSnapshot) => {
                                const compCount = compSnapshot.size;
                                
                                // Add to completed count
                                completed += compCount;
                                
                                // Calculate in-progress (simplified assumption)
                                const inProgressCount = Math.floor(regCount * 0.6) - compCount;
                                inProgress += inProgressCount > 0 ? inProgressCount : 0;
                                
                                // Calculate abandoned (simplified assumption)
                                const abandonedCount = regCount - compCount - inProgressCount;
                                abandoned += abandonedCount > 0 ? abandonedCount : 0;
                            });
                    });
            });
            
            Promise.all(promises)
                .then(() => {
                    renderCompletionStatsChart(completed, inProgress, abandoned);
                });
        })
        .catch((error) => {
            console.error("Error fetching completion stats:", error);
        });
}

// Render the completion stats chart
function renderCompletionStatsChart(completed, inProgress, abandoned) {
    const ctx = document.getElementById('completionStatsChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.completionChart) {
        window.completionChart.destroy();
    }
    
    window.completionChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Abandoned'],
            datasets: [{
                data: [completed, inProgress, abandoned],
                backgroundColor: [
                    'rgba(16, 185, 129, 0.7)', // Green
                    'rgba(245, 158, 11, 0.7)', // Yellow
                    'rgba(239, 68, 68, 0.7)'  // Red
                ],
                borderColor: [
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(239, 68, 68, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Fetch top workshops for the table
function fetchTopWorkshops() {
    db.collection('workshops')
        .orderBy('registrationCount', 'desc')
        .limit(5)
        .get()
        .then((snapshot) => {
            let tableHTML = '';
            
            if (snapshot.empty) {
                tableHTML = `
                    <tr>
                        <td colspan="5" class="py-4 px-4 text-center text-gray-500">No workshop data available</td>
                    </tr>
                `;
            } else {
                snapshot.forEach(doc => {
                    const workshop = doc.data();
                    const registrations = workshop.registrationCount || 0;
                    const completions = workshop.completionCount || 0;
                    const completionRate = registrations > 0 ? 
                        ((completions / registrations) * 100).toFixed(1) + '%' : '0%';
                    const rating = workshop.averageRating ? 
                        workshop.averageRating.toFixed(1) + '/5.0' : 'No ratings';
                    
                    let statusClass = '';
                    let statusText = '';
                    
                    if (workshop.status === 'active') {
                        statusClass = 'bg-green-100 text-green-800';
                        statusText = 'Active';
                    } else if (workshop.status === 'scheduled') {
                        statusClass = 'bg-blue-100 text-blue-800';
                        statusText = 'Scheduled';
                    } else if (workshop.status === 'completed') {
                        statusClass = 'bg-gray-100 text-gray-800';
                        statusText = 'Completed';
                    } else {
                        statusClass = 'bg-yellow-100 text-yellow-800';
                        statusText = 'Draft';
                    }
                    
                    tableHTML += `
                        <tr>
                            <td class="py-3 px-4 border-b">${workshop.title || 'Untitled Workshop'}</td>
                            <td class="py-3 px-4 border-b">${registrations}</td>
                            <td class="py-3 px-4 border-b">${completionRate}</td>
                            <td class="py-3 px-4 border-b">${rating}</td>
                            <td class="py-3 px-4 border-b">
                                <span class="px-2 py-1 rounded-full text-xs ${statusClass}">
                                    ${statusText}
                                </span>
                            </td>
                        </tr>
                    `;
                });
            }
            
            document.getElementById('topWorkshops').innerHTML = tableHTML;
        })
        .catch((error) => {
            console.error("Error fetching top workshops:", error);
            document.getElementById('topWorkshops').innerHTML = `
                <tr>
                    <td colspan="5" class="py-4 px-4 text-center text-red-500">
                        Error loading workshop data. Please try again.
                    </td>
                </tr>
            `;
        });
}

// Set up event listeners
function setupEventListeners() {
    // Time range selector
    document.getElementById('timeRange').addEventListener('change', function() {
        loadAnalyticsData();
    });
    
    // Export button
    document.getElementById('exportBtn').addEventListener('click', function() {
        exportAnalyticsData();
    });
}

// Export analytics data as CSV
function exportAnalyticsData() {
    const timeRange = document.getElementById('timeRange').value;
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Workshop Name,Registrations,Completions,Completion Rate,Average Rating\n";
    
    // Get workshop data
    db.collection('workshops')
        .orderBy('registrationCount', 'desc')
        .get()
        .then((snapshot) => {
            snapshot.forEach(doc => {
                const workshop = doc.data();
                const registrations = workshop.registrationCount || 0;
                const completions = workshop.completionCount || 0;
                const completionRate = registrations > 0 ? 
                    ((completions / registrations) * 100).toFixed(1) + '%' : '0%';
                const rating = workshop.averageRating ? 
                    workshop.averageRating.toFixed(1) : 'N/A';
                
                // Add row
                csvContent += `"${workshop.title}",${registrations},${completions},${completionRate},${rating}\n`;
            });
            
            // Create download link
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `workshop_analytics_${timeRange}days.csv`);
            document.body.appendChild(link);
            
            // Download file
            link.click();
            
            // Log the export activity
            logAdminActivity('Data Export', `Exported analytics data for ${timeRange} days period`);
        })
        .catch((error) => {
            console.error("Error exporting data:", error);
            alert("Error exporting data. Please try again.");
        });
}

// Log admin activity
function logAdminActivity(activityType, description) {
    if (!currentUser) return Promise.reject("No user logged in");
    
    return db.collection('adminLogs').add({
        userId: currentUser.uid,
        email: currentUser.email,
        activityType: activityType,
        description: description,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
}