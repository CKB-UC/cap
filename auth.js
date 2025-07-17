// Initialize Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC3KWRTGbH7C-e2Que6IW9VS3Xdl_Hsy7E",
    authDomain: "ratbow-454f1.firebaseapp.com",
    projectId: "ratbow-454f1",
    storageBucket: "ratbow-454f1.firebasestorage.app",
    messagingSenderId: "494138400120",
    appId: "1:494138400120:web:d8eac6dc7437431b783c8d",
    measurementId: "G-71PNRPMEKP"
};

if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

// Social login providers
const googleProvider = new firebase.auth.GoogleAuthProvider();

// Function to show registration modal
function showRegistrationModal(workshopData, callback) {
    const modal = document.createElement('div');
    modal.className = 'registration-modal-overlay';
    modal.innerHTML = `
        <div class="registration-modal">
            <span class="close-modal">&times;</span>
            <h2>Register for ${workshopData.title}</h2>
            
            <div class="social-login-options">
                <p>Sign up with:</p>
                <button class="social-login-btn google" id="google-signup">
                    <i class="fab fa-google"></i> Google
                </button>
                <button class="social-login-btn facebook" id="facebook-signup">
                    <i class="fab fa-facebook"></i> Facebook
                </button>
                <button class="social-login-btn yahoo" id="yahoo-signup">
                    <i class="fab fa-yahoo"></i> Yahoo
                </button>
                <p class="divider">or</p>
            </div>
            
            <form id="email-signup-form">
                <div class="form-group">
                    <label for="fullname">Full Name</label>
                    <input type="text" id="fullname" required>
                </div>
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password (min 6 characters)</label>
                    <input type="password" id="password" required minlength="6">
                </div>
                <div class="form-group">
                    <label for="demographics">Demographic Information</label>
                    <select id="demographics" required>
                        <option value="">Select your category</option>
                        <option value="student">Student</option>
                        <option value="professional">Working Professional</option>
                        <option value="job_seeker">Job Seeker</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                <button type="submit" class="btn-primary">Register & Sign Up</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Close modal handler
    modal.querySelector('.close-modal').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // Social login handlers
    modal.querySelector('#google-signup').addEventListener('click', () => socialSignUp(googleProvider, workshopData, callback));
    modal.querySelector('#facebook-signup').addEventListener('click', () => socialSignUp(facebookProvider, workshopData, callback));
    modal.querySelector('#yahoo-signup').addEventListener('click', () => socialSignUp(yahooProvider, workshopData, callback));

    // Email signup handler
    modal.querySelector('#email-signup-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = modal.querySelector('#email').value;
        const password = modal.querySelector('#password').value;
        const fullName = modal.querySelector('#fullname').value;
        const demographics = modal.querySelector('#demographics').value;
        
        emailSignUp(email, password, fullName, demographics, workshopData, callback);
    });
}

// Google sign up function
async function socialSignUp(provider, workshopData, callback) {
    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;
        
        // Save additional user data
        await db.collection('users').doc(user.uid).set({
            name: user.displayName || 'Google User',
            email: user.email,
            demographics: 'google_user',
            workshops: [workshopData.id]
        }, { merge: true });
        
        // Register for workshop
        await registerForWorkshop(workshopData.id, user.uid);
        
        // Send confirmation email
        sendWorkshopConfirmation(user.email, workshopData);
        
        if (callback) callback();
    } catch (error) {
        console.error("Google sign up error:", error);
        alert("Google sign up failed: " + error.message);
    }
}

// Email sign up function
async function emailSignUp(email, password, fullName, demographics, workshopData, callback) {
    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Save additional user data
        await db.collection('users').doc(user.uid).set({
            name: fullName,
            email: email,
            demographics: demographics,
            workshops: [workshopData.id]
        }, { merge: true });
        
        // Send email verification
        await user.sendEmailVerification();
        
        // Register for workshop
        await registerForWorkshop(workshopData.id, user.uid);
        
        // Send confirmation email
        sendWorkshopConfirmation(email, workshopData);
        
        if (callback) callback();
    } catch (error) {
        console.error("Email sign up error:", error);
        alert("Registration failed: " + error.message);
    }
}

// Workshop registration function
async function registerForWorkshop(workshopId, userId) {
    const workshopRef = db.collection('workshops').doc(workshopId);
    
    return db.runTransaction(async (transaction) => {
        const workshopDoc = await transaction.get(workshopRef);
        if (!workshopDoc.exists) throw new Error('Workshop not found');
        
        const workshop = workshopDoc.data();
        const registeredUsers = workshop.registeredUsers || [];
        
        if (!registeredUsers.includes(userId)) {
            registeredUsers.push(userId);
            transaction.update(workshopRef, {
                registeredUsers,
                registered: registeredUsers.length
            });
        }
        
        return true;
    });
}

// Email confirmation function
function sendWorkshopConfirmation(email, workshopData) {
    // In a real app, you would use a cloud function or email service
    console.log(`Sending confirmation to ${email} for workshop ${workshopData.title}`);
    
    // This would be replaced with actual email sending logic
    db.collection('mail').add({
        to: email,
        message: {
            subject: `Workshop Registration Confirmation: ${workshopData.title}`,
            html: `
                <h1>Thank you for registering!</h1>
                <p>You have successfully registered for:</p>
                <h2>${workshopData.title}</h2>
                <p><strong>Date:</strong> ${workshopData.date.toDate().toLocaleString()}</p>
                <p><strong>Location:</strong> ${workshopData.location}</p>
            `
        }
    }).then(() => {
        console.log("Confirmation email queued");
    });
}

function updateNavigationAuthState(user) {
    const navLinks = document.querySelector('.nav-links');
    const logoutBtn = document.querySelector('.btn-logout');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (user) {
        // User is logged in - hide auth buttons
        if (authButtons) authButtons.style.display = 'none';
        
        if (!logoutBtn) {
            // Create logout button if it doesn't exist
            const logoutButton = document.createElement('button');
            logoutButton.className = 'btn-logout';
            logoutButton.textContent = 'Logout';
            logoutButton.onclick = logout;
            navLinks.appendChild(logoutButton);
        }
        
        // Show admin dashboard link if user is admin
        if (user.email && user.email.endsWith('@admin.com')) {
            document.querySelector('.admin-dashboard').style.display = 'inline-block';
        }
    } else {
        // User is logged out - show auth buttons
        if (authButtons) authButtons.style.display = 'flex';
        if (logoutBtn) {
            logoutBtn.remove();
        }
        document.querySelector('.admin-dashboard').style.display = 'none';
    }
}

// Update the auth state changed handler
auth.onAuthStateChanged((user) => {
    updateNavigationAuthState(user);
});

// Make sure logout function is available
function logout() {
    auth.signOut().then(() => {
        console.log('User signed out');
        // The auth state change handler will update the UI automatically
    }).catch((error) => {
        console.error('Sign out error:', error);
    });
}