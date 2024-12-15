document.addEventListener('DOMContentLoaded', () => {
    // Select all register buttons
    const registerButtons = document.querySelectorAll('.register-btn');
    
    registerButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the parent announcement card
            const card = this.closest('.announcement-card');
            
            // Extract workshop details
            const title = card.querySelector('h3').textContent;
            const date = card.querySelector('p:nth-child(2)').textContent.replace('Date:', '').trim();
            const time = card.querySelector('p:nth-child(3)').textContent.replace('Time:', '').trim();
            const location = card.querySelector('p:nth-child(4)').textContent.replace('Where:', '').trim();

            // Create registration popup
            const popupContainer = document.createElement('div');
            popupContainer.id = 'registration-popup';
            popupContainer.innerHTML = `
                <div class="registration-overlay">
                    <div class="registration-modal">
                        <span class="close-registration">&times;</span>
                        <h2>Register for ${title}</h2>
                        <div class="workshop-details">
                            <p><strong>Date:</strong> ${date}</p>
                            <p><strong>Time:</strong> ${time}</p>
                            <p><strong>Location:</strong> ${location}</p>
                        </div>
                        <form id="workshop-registration-form">
                            <div class="form-group">
                                <label for="name">Full Name</label>
                                <input type="text" id="name" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="email">Email Address</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" name="phone" required>
                            </div>
                            <input type="hidden" id="workshop-title" value="${title}">
                            <button type="submit" class="submit-registration">Confirm Registration</button>
                        </form>
                    </div>
                </div>
            `;
            
            // Add popup to body
            document.body.appendChild(popupContainer);

            // Close button functionality
            const closeButton = popupContainer.querySelector('.close-registration');
            closeButton.addEventListener('click', () => {
                document.body.removeChild(popupContainer);
            });

            // Form submission
            const form = popupContainer.querySelector('#workshop-registration-form');
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Gather form data
                const name = form.querySelector('#name').value;
                const email = form.querySelector('#email').value;
                const phone = form.querySelector('#phone').value;
                const workshopTitle = form.querySelector('#workshop-title').value;

                // Email validation
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    alert('Please enter a valid email address');
                    return;
                }

                // Phone validation (Philippine format)
                const phoneRegex = /^(09|\+639)\d{9}$/;
                if (!phoneRegex.test(phone)) {
                    alert('Please enter a valid Philippine phone number (e.g., 09123456789)');
                    return;
                }

                // Here you would typically send the data to a backend service
                // For now, we'll just show a success message
                alert(`Thank you, ${name}! You have been registered for ${workshopTitle}. 
A confirmation will be sent to ${email} and ${phone}.`);

                // Remove the popup
                document.body.removeChild(popupContainer);
            });
        });
    });
});