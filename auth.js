// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC3KWRTGbH7C-e2Que6IW9VS3Xdl_Hsy7E",
    authDomain: "ratbow-454f1.firebaseapp.com",
    projectId: "ratbow-454f1",
    storageBucket: "ratbow-454f1.firebasestorage.app",
    messagingSenderId: "494138400120",
    appId: "1:494138400120:web:d8eac6dc7437431b783c8d",
    measurementId: "G-71PNRPMEKP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');
const registerEmail = document.getElementById('registerEmail');
const registerPassword = document.getElementById('registerPassword');
const registerName = document.getElementById('registerName');
const errorMessage = document.getElementById('error-message');

// Get Firebase instances
const auth = firebase.auth();
const db = firebase.firestore();

// Check if we're on the register page
if (registerForm) {
    console.log('Register form found');
    // Register functionality
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        console.log('Registration form submitted');
        errorMessage.textContent = ''; // Clear any previous errors
        
        try {
            if (!registerEmail.value || !registerPassword.value || !registerName.value) {
                errorMessage.textContent = 'Please fill in all fields';
                return;
            }

            if (registerPassword.value.length < 6) {
                errorMessage.textContent = 'Password must be at least 6 characters long';
                return;
            }

            // Disable the submit button to prevent double submission
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;
            
            console.log('Creating user account...');
            const userCredential = await firebase.auth().createUserWithEmailAndPassword(
                registerEmail.value,
                registerPassword.value
            );
            
            console.log('User account created, now creating user document...');
            
            // Create user document with default role as 'user'
            await firebase.firestore().collection('users').doc(userCredential.user.uid).set({
                name: registerName.value,
                email: registerEmail.value,
                role: 'user',
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('Registration complete, redirecting...');
            alert('Registration successful!');
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Registration error:', error);
            errorMessage.textContent = error.message;
            // Re-enable the submit button if there was an error
            const submitButton = registerForm.querySelector('button[type="submit"]');
            submitButton.disabled = false;
        }
    });
} else {
    console.log('Register form not found - might be on a different page');
}

// Check if we're on the login page
if (loginForm) {
    // Login functionality
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        try {
            const userCredential = await auth.signInWithEmailAndPassword(
                loginEmail.value,
                loginPassword.value
            );
            
            // Check user role
            const userDoc = await db.collection('users').doc(userCredential.user.uid).get();
            
            if (!userDoc.exists) {
                // If user document doesn't exist, create it with default role
                await db.collection('users').doc(userCredential.user.uid).set({
                    name: userCredential.user.email.split('@')[0],
                    email: userCredential.user.email,
                    role: 'user',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                window.location.href = 'index.html';
                return;
            }
            
            const userData = userDoc.data();
            
            if (userData.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'index.html';
            }
        } catch (error) {
            alert(error.message);
        }
    });
} else {
    console.log('Login form not found - might be on a different page');
}

// Logout functionality
function logout() {
    firebase.auth().signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout error:', error);
        alert('Error logging out: ' + error.message);
    });
}

// Make logout function available globally
window.logout = logout;

// Auth state observer
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is signed in
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (!doc.exists) {
                // If user document doesn't exist, create it with default role
                db.collection('users').doc(user.uid).set({
                    name: user.email.split('@')[0],
                    email: user.email,
                    role: 'user',
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                });
                return;
            }
            
            const userData = doc.data();
            if (userData.role === 'admin') {
                // Show admin features
                document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'block');
            }
        });
    } else {
        // User is signed out
        document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'none');
    }
}); 