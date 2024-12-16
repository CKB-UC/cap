// Add this to workshop.js or create a new calendar.js file to be included in workshops.html

document.addEventListener('DOMContentLoaded', () => {
    // Create calendar popup HTML
    const calendarPopupHTML = `
    <div id="calendar-popup" class="calendar-popup">
        <div class="calendar-content">
            <span class="close-calendar">&times;</span>
            <div class="calendar-container">
                <div class="calendar-header">
                    <button id="prev-month">←</button>
                    <h2 id="current-month">Month Year</h2>
                    <button id="next-month">→</button>
                </div>
                <div class="calendar-grid" id="calendar-days"></div>
            </div>
        </div>
    </div>
    `;

    // Add calendar popup to the body
    document.body.insertAdjacentHTML('beforeend', calendarPopupHTML);

    // Events data
    const events = [
        {
            name: "Critical Thinking Workshop",
            date: new Date(2024, 10, 15), // November 15, 2024
            time: "10:00 AM - 2:00 PM",
            location: "Baguio City"
        },
        {
            name: "Interview Mastery Seminar",
            date: new Date(2024, 11, 5), // December 5, 2024
            time: "9:00 AM - 1:00 PM",
            location: "Baguio City"
        },
        {
            name: "Time Management Bootcamp",
            date: new Date(2025, 0, 20), // January 20, 2025
            time: "11:00 AM - 3:00 PM",
            location: "Baguio City"
        }
    ];

    class Calendar {
        constructor(containerElement) {
            this.containerElement = containerElement;
            this.currentDate = new Date();
            this.events = events;

            this.init();
        }

        init() {
            this.renderHeader();
            this.renderCalendar();
            this.attachEventListeners();
        }

        renderHeader() {
            const monthNames = [
                "January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            document.getElementById('current-month').textContent = 
                `${monthNames[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
        }

        renderCalendar() {
            const calendarDays = document.getElementById('calendar-days');
            calendarDays.innerHTML = ''; // Clear previous calendar

            // Days of the week headers
            const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            weekdays.forEach(day => {
                const dayHeader = document.createElement('div');
                dayHeader.textContent = day;
                dayHeader.style.fontWeight = 'bold';
                calendarDays.appendChild(dayHeader);
            });

            // Calculate first day of the month and number of days
            const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
            const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
            
            // Add blank spaces for days before the first day
            for (let i = 0; i < firstDay.getDay(); i++) {
                calendarDays.appendChild(document.createElement('div'));
            }

            // Render calendar days
            for (let day = 1; day <= lastDay.getDate(); day++) {
                const dayElement = document.createElement('div');
                dayElement.classList.add('calendar-day');
                dayElement.textContent = day;

                // Check for events on this day
                const currentDate = new Date(
                    this.currentDate.getFullYear(), 
                    this.currentDate.getMonth(), 
                    day
                );

                const dayEvents = this.events.filter(event => 
                    event.date.toDateString() === currentDate.toDateString()
                );

                if (dayEvents.length > 0) {
                    dayElement.classList.add('has-event');
                    
                    // Create event details popup
                    const eventDetails = document.createElement('div');
                    eventDetails.classList.add('event-details');
                    dayEvents.forEach(event => {
                        eventDetails.innerHTML += `
                            <strong>${event.name}</strong><br>
                            Time: ${event.time}<br>
                            Location: ${event.location}
                        `;
                    });
                    dayElement.appendChild(eventDetails);
                }

                calendarDays.appendChild(dayElement);
            }
        }

        attachEventListeners() {
            document.getElementById('prev-month').addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() - 1);
                this.renderHeader();
                this.renderCalendar();
            });

            document.getElementById('next-month').addEventListener('click', () => {
                this.currentDate.setMonth(this.currentDate.getMonth() + 1);
                this.renderHeader();
                this.renderCalendar();
            });
        }
    }

    // Calendar toggle functionality
    const calendarToggle = document.getElementById('calendar-toggle');
    const calendarPopup = document.getElementById('calendar-popup');
    const closeCalendar = document.querySelector('.close-calendar');

    // Toggle calendar popup
    calendarToggle.addEventListener('click', (e) => {
        e.preventDefault();
        calendarPopup.style.display = 'block';
        // Initialize calendar when opened
        new Calendar(document.querySelector('.calendar-container'));
    });

    // Close calendar popup
    closeCalendar.addEventListener('click', () => {
        calendarPopup.style.display = 'none';
    });

    // Close popup if clicked outside
    window.addEventListener('click', (e) => {
        if (e.target === calendarPopup) {
            calendarPopup.style.display = 'none';
        }
    });
});