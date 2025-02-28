// Check if user is logged in
document.addEventListener('DOMContentLoaded', function() {
    auth.onAuthStateChanged(user => {
        if (user) {
            loadUserProfile(user);
        } else {
            // Not logged in, redirect to login
            window.location.href = 'login.html';
        }
    });

    // Profile form submission
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', updateProfile);
    }

    // Password change button toggle
    const changePasswordBtn = document.getElementById('change-password-btn');
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', togglePasswordForm);
    }

    // Password change form submission
    const passwordForm = document.getElementById('password-form');
    if (passwordForm) {
        passwordForm.addEventListener('submit', changePassword);
    }

    // Logout Button
    const logoutButton = document.getElementById('logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', handleLogout);
    }
});

// Load user profile data
async function loadUserProfile(user) {
    try {
        // Display user email
        const userEmailElement = document.getElementById('user-email');
        if (userEmailElement) {
            userEmailElement.textContent = user.email;
        }

        // Get user data from firestore
        const userDoc = await db.collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
            const userData = userDoc.data();
            
            // Display user name
            const userNameElement = document.getElementById('user-name');
            if (userNameElement) {
                userNameElement.textContent = userData.fullName || 'User';
            }
            
            // Fill the profile form if it exists
            const fullNameInput = document.getElementById('fullName');
            if (fullNameInput) {
                fullNameInput.value = userData.fullName || '';
            }
            
            const phoneInput = document.getElementById('phone');
            if (phoneInput) {
                phoneInput.value = userData.phone || '';
            }
            
            const addressInput = document.getElementById('address');
            if (addressInput) {
                addressInput.value = userData.address || '';
            }
            
            // Show role-specific content
            const userRole = userData.role || 'customer';
            if (userRole === 'admin') {
                const adminOnlyElements = document.querySelectorAll('.admin-only');
                adminOnlyElements.forEach(el => {
                    el.style.display = 'block';
                });
            }
        }
    } catch (error) {
        console.error('Error loading user profile:', error);
        showMessage('Error loading profile. Please try again.', 'error');
    }
}

// Update user profile
async function updateProfile(e) {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) return;
    
    const updateBtn = document.getElementById('update-profile-btn');
    updateBtn.disabled = true;
    updateBtn.textContent = 'Updating...';
    
    try {
        // Get form data
        const fullName = document.getElementById('fullName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const address = document.getElementById('address').value.trim();
        
        // Update profile in Firestore
        await db.collection('users').doc(user.uid).update({
            fullName,
            phone,
            address,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        // Update display name in Firebase Auth
        await user.updateProfile({
            displayName: fullName
        });
        
        showMessage('Profile updated successfully!', 'success');
    } catch (error) {
        console.error('Error updating profile:', error);
        showMessage('Error updating profile. Please try again.', 'error');
    } finally {
        updateBtn.disabled = false;
        updateBtn.textContent = 'Update Profile';
    }
}

// Toggle password change form
function togglePasswordForm() {
    const passwordFormContainer = document.getElementById('password-form-container');
    if (passwordFormContainer) {
        if (passwordFormContainer.style.display === 'none' || !passwordFormContainer.style.display) {
            passwordFormContainer.style.display = 'block';
        } else {
            passwordFormContainer.style.display = 'none';
        }
    }
}

// Change password
async function changePassword(e) {
    e.preventDefault();
    
    const user = auth.currentUser;
    if (!user) return;
    
    const changeBtn = document.getElementById('change-password-submit');
    changeBtn.disabled = true;
    changeBtn.textContent = 'Processing...';
    
    try {
        // Get form data
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate new password
        if (newPassword.length < 6) {
            throw new Error('New password must be at least 6 characters long.');
        }
        
        // Check if passwords match
        if (newPassword !== confirmPassword) {
            throw new Error('New passwords do not match.');
        }
        
        // Reauthenticate with current password
        const credential = firebase.auth.EmailAuthProvider.credential(
            user.email,
            currentPassword
        );
        
        await user.reauthenticateWithCredential(credential);
        
        // Update password
        await user.updatePassword(newPassword);
        
        // Clear form and hide
        document.getElementById('password-form').reset();
        document.getElementById('password-form-container').style.display = 'none';
        
        showMessage('Password updated successfully!', 'success');
    } catch (error) {
        console.error('Error changing password:', error);
        
        let errorMessage = 'Error updating password. Please try again.';
        if (error.code === 'auth/wrong-password') {
            errorMessage = 'Current password is incorrect.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showMessage(errorMessage, 'error');
    } finally {
        changeBtn.disabled = false;
        changeBtn.textContent = 'Change Password';
    }
}

// Handle User Logout
function handleLogout(e) {
    e.preventDefault();
    
    auth.signOut()
        .then(() => {
            window.location.href = 'login.html';
        })
        .catch((error) => {
            console.error('Error signing out:', error);
            showMessage('Error signing out. Please try again.', 'error');
        });
}

// Show message function (used for success/error messages)
function showMessage(message, type = 'info') {
    const messageContainer = document.getElementById('message-container');
    if (!messageContainer) {
        // Create message container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'message-container';
        container.style.position = 'fixed';
        container.style.top = '20px';
        container.style.right = '20px';
        container.style.zIndex = '1000';
        document.body.appendChild(container);
    }
    
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.margin = '10px';
    alert.style.padding = '10px 20px';
    alert.style.borderRadius = '5px';
    alert.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    
    if (type === 'success') {
        alert.style.backgroundColor = '#d4edda';
        alert.style.color = '#155724';
        alert.style.borderColor = '#c3e6cb';
    } else if (type === 'error') {
        alert.style.backgroundColor = '#f8d7da';
        alert.style.color = '#721c24';
        alert.style.borderColor = '#f5c6cb';
    } else {
        alert.style.backgroundColor = '#d1ecf1';
        alert.style.color = '#0c5460';
        alert.style.borderColor = '#bee5eb';
    }
    
    document.getElementById('message-container').appendChild(alert);
    
    // Remove after 5 seconds
    setTimeout(() => {
        alert.remove();
    }, 5000);
}