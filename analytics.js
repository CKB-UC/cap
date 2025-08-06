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
}

// Show loading state for dashboard elements
function showLoadingState() {
    document.getElementById('registrationRate').textContent = "Loading...";
    document.getElementById('completionRate').textContent = "Loading...";
    document.getElementById('userGrowth').textContent = "Loading...";
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
    const userRegistrationsData = [];
    const userLoginsData = [];
    
    // Create date labels (simplified version for demo)
    const format = { month: 'short', day: 'numeric' };
    const days = parseInt(selectedTimeRange);
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', format));
        // Initialize with zeros
        userRegistrationsData.push(0);
        userLoginsData.push(0);
    }
    
    // Get user registrations grouped by day
    db.collection('users')
        .where('createdAt', '>=', startDate)
        .where('createdAt', '<=', endDate)
        .get()
        .then((snapshot) => {
            // Process user registrations
            snapshot.forEach(doc => {
                const userData = doc.data();
                if (userData.createdAt) {
                    const registrationDate = userData.createdAt.toDate();
                    const dayDiff = Math.floor((endDate - registrationDate) / (1000 * 60 * 60 * 24));
                    if (dayDiff >= 0 && dayDiff < days) {
                        userRegistrationsData[days - 1 - dayDiff]++;
                    }
                }
            });
            
            // Get user logins grouped by day (if you have login tracking)
            db.collection('userLogins')  // Assuming you have a collection tracking logins
                .where('timestamp', '>=', startDate)
                .where('timestamp', '<=', endDate)
                .get()
                .then((loginSnapshot) => {
                    // Process logins
                    loginSnapshot.forEach(doc => {
                        const loginData = doc.data();
                        if (loginData.timestamp) {
                            const loginDate = loginData.timestamp.toDate();
                            const dayDiff = Math.floor((endDate - loginDate) / (1000 * 60 * 60 * 24));
                            if (dayDiff >= 0 && dayDiff < days) {
                                userLoginsData[days - 1 - dayDiff]++;
                            }
                        }
                    });
                    
                    // Render the chart with user data
                    renderRegistrationTrendsChart(labels, userRegistrationsData, userLoginsData);
                });
        })
        .catch((error) => {
            console.error("Error fetching registration trends:", error);
        });
}

// Update the chart rendering function to show user data
function renderRegistrationTrendsChart(labels, userRegistrationsData, userLoginsData) {
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
                    label: 'New User Registrations',
                    data: userRegistrationsData,
                    borderColor: 'rgba(59, 130, 246, 1)', // Blue
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'User Logins',
                    data: userLoginsData,
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
                    },
                    title: {
                        display: true,
                        text: 'Number of Users'
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
                },
                title: {
                    display: true,
                    text: 'User Registration and Login Trends'
                }
            }
        }
    });
}

// Fetch workshop popularity data for the bar chart
function fetchWorkshopPopularity() {
    db.collection('workshops')
        .get()
        .then((snapshot) => {
            // Initialize an object to store tag data
            const tagData = {};
            
            // Process each workshop
            snapshot.forEach(doc => {
                const workshop = doc.data();
                const tag = workshop.tag || 'other';
                
                // Initialize tag entry if it doesn't exist
                if (!tagData[tag]) {
                    tagData[tag] = {
                        count: 0,
                        totalRating: 0,
                        workshops: 0
                    };
                }
                
                // Count workshops with this tag
                tagData[tag].workshops++;
                
                // If workshop has ratings, calculate average
                if (workshop.ratings) {
                    const ratings = Object.values(workshop.ratings);
                    if (ratings.length > 0) {
                        const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
                        tagData[tag].totalRating += avgRating;
                        tagData[tag].count++;
                    }
                }
            });
            
            // Prepare data for chart
            const labels = [];
            const avgRatings = [];
            const workshopCounts = [];
            
            // Calculate average rating per tag
            Object.keys(tagData).forEach(tag => {
                labels.push(tag.charAt(0).toUpperCase() + tag.slice(1).replace('-', ' '));
                const tagInfo = tagData[tag];
                const avgRating = tagInfo.count > 0 ? (tagInfo.totalRating / tagInfo.count) : 0;
                avgRatings.push(avgRating);
                workshopCounts.push(tagInfo.workshops);
            });
            
            renderWorkshopPopularityChart(labels, avgRatings, workshopCounts);
        })
        .catch((error) => {
            console.error("Error fetching workshop popularity:", error);
        });
}

// Render the workshop popularity chart
function renderWorkshopPopularityChart(labels, avgRatings, workshopCounts) {
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
                    label: 'Average Rating',
                    data: avgRatings,
                    backgroundColor: 'rgba(59, 130, 246, 0.7)', // Blue
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Number of Workshops',
                    data: workshopCounts,
                    backgroundColor: 'rgba(16, 185, 129, 0.7)', // Green
                    borderColor: 'rgba(16, 185, 129, 1)',
                    borderWidth: 1,
                    type: 'line',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Average Rating (1-5)'
                    },
                    min: 0,
                    max: 5,
                    ticks: {
                        stepSize: 0.5
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Number of Workshops'
                    },
                    min: 0,
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 0) {
                                label += context.raw.toFixed(1) + ' stars';
                            } else {
                                label += context.raw;
                            }
                            return label;
                        }
                    }
                },
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
            // Initialize counters
            const demographics = {
                'Student': 0,
                'Employed': 0,
                'Unemployed': 0,
                'Other': 0
            };
            
            // Count users by employment status
            snapshot.forEach(doc => {
                const user = doc.data();
                const status = user.employmentStatus || user.occupation || user.role || '';
                const lowerStatus = status.toString().toLowerCase();
                
                if (lowerStatus.includes('student') || 
                    lowerStatus.includes('learner') || 
                    lowerStatus.includes('college') || 
                    lowerStatus.includes('university')) {
                    demographics['Student']++;
                } 
                else if (lowerStatus.includes('employed') || 
                         lowerStatus.includes('working') || 
                         lowerStatus.includes('job') || 
                         lowerStatus.includes('professional') ||
                         lowerStatus.includes('business')) {
                    demographics['Employed']++;
                } 
                else if (lowerStatus.includes('unemployed') || 
                         lowerStatus.includes('jobless') || 
                         lowerStatus.includes('looking') ||
                         lowerStatus === '') {  // Treat empty as unemployed
                    demographics['Unemployed']++;
                } 
                else {
                    // Log unexpected statuses for debugging
                    if (status && !['admin', 'superadmin'].includes(lowerStatus)) {
                        console.log('Unclassified status:', status);
                    }
                    demographics['Other']++;
                }
            });
            
            renderUserDemographicsChart(demographics);
        })
        .catch((error) => {
            console.error("Error fetching user demographics:", error);
        });
}

// Render the user demographics chart (keep the same as before)
function renderUserDemographicsChart(demographicsData) {
    const ctx = document.getElementById('userDemographicsChart').getContext('2d');
    
    if (window.demographicsChart) {
        window.demographicsChart.destroy();
    }
    
    window.demographicsChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: Object.keys(demographicsData),
            datasets: [{
                data: Object.values(demographicsData),
                backgroundColor: [
                    'rgba(59, 130, 246, 0.7)',  // Blue - Student
                    'rgba(16, 185, 129, 0.7)',  // Green - Employed
                    'rgba(245, 158, 11, 0.7)',  // Yellow - Unemployed
                    'rgba(156, 163, 175, 0.7)'  // Gray - Other
                ],
                borderColor: [
                    'rgba(59, 130, 246, 1)',
                    'rgba(16, 185, 129, 1)',
                    'rgba(245, 158, 11, 1)',
                    'rgba(156, 163, 175, 1)'
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