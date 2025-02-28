// Check if user is already logged in
document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(user => {
        if (user) {
            // If on login page, redirect to home
            if (window.location.pathname.includes('login.html')) {
                window.location.href = 'index.html';
            }
        }
    });

    // Login Form
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Registration Form
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    // Logout Button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});

// Handle User Login
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');
    
    try {
        // Sign in with email and password
        const userCredential = await auth.signInWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Check if user is admin
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (userData && userData.role === 'admin') {
            window.location.href = 'admin/dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    } catch (error) {
        errorMessage.textContent = getErrorMessage(error);
        errorMessage.style.display = 'block';
    }
}

// Handle User Registration
async function handleRegister(e) {
    e.preventDefault();
    
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const phone = document.getElementById('phone').value;
    const errorMessage = document.getElementById('error-message');
    
    // Validate password match
    if (password !== confirmPassword) {
        errorMessage.textContent = 'Passwords do not match';
        errorMessage.style.display = 'block';
        return;
    }
    
    try {
        // Create user with email and password
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Add user data to Firestore
        await db.collection('users').doc(user.uid).set({
            fullName: fullName,
            email: email,
            phone: phone,
            role: 'customer', // Default role is customer
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update user profile
        await user.updateProfile({
            displayName: fullName
        });
        
        // Redirect to home page
        window.location.href = 'index.html';
    } catch (error) {
        errorMessage.textContent = getErrorMessage(error);
        errorMessage.style.display = 'block';
    }
}

// Handle User Logout
function handleLogout(e) {
    e.preventDefault();
    
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
        });
}

// User error messages
function getErrorMessage(error) {
    switch (error.code) {
        case 'auth/invalid-email':
            return 'Invalid email address format';
        case 'auth/user-disabled':
            return 'This account has been disabled';
        case 'auth/user-not-found':
            return 'Email or password is incorrect';
        case 'auth/wrong-password':
            return 'Email or password is incorrect';
        case 'auth/email-already-in-use':
            return 'An account with this email already exists';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters';
        default:
            return 'An error occurred. Please try again.';
    }
}