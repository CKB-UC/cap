# Workshop Registration Email Verification System

This document explains how the email verification system works for workshop registrations.

## Overview

When users register for workshops and create accounts through the workshop registration process, they now go through the same email verification system as regular registrations.

## Registration Flows

### 1. Workshop Registration Modal
- **Location**: `auth.js` - `emailSignUp()` and `socialSignUp()` functions
- **Trigger**: When users click "Register" on a workshop and choose to create an account
- **Process**:
  1. User fills out registration form in workshop modal
  2. Account is created in Firebase Auth
  3. User data is saved to Firestore with verification status
  4. Custom email verification is sent (or Firebase fallback)
  5. User is redirected to verification pending page

### 2. Direct Workshop Registration
- **Location**: `workshop.js` - `showRegistrationForm()` function
- **Trigger**: When users register directly from workshop details page
- **Process**:
  1. User fills out registration form
  2. Account is created in Firebase Auth
  3. User data is saved to Firestore with verification status
  4. Custom email verification is sent (or Firebase fallback)
  5. User is redirected to verification pending page

### 3. Social Login Registration
- **Location**: `auth.js` - `socialSignUp()` function
- **Trigger**: When users choose Google/Facebook/Yahoo login
- **Process**:
  1. User authenticates with social provider
  2. Account is created in Firebase Auth
  3. User data is saved to Firestore with verification status
  4. If email is already verified by provider, status is updated to verified
  5. User is redirected based on verification status

## Verification Status

All workshop registrations now include these verification fields:

```javascript
{
    verificationStatus: 'pending', // pending, verified, rejected
    emailVerified: false,
    phoneVerified: false,
    adminApproved: false,
    verificationSubmittedAt: firebase.firestore.FieldValue.serverTimestamp(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    role: 'user'
}
```

## Email Verification Process

### Custom Email System (Preferred)
1. Sends verification email via Gmail SMTP
2. Uses custom HTML templates
3. Includes verification link with token
4. 24-hour token expiration

### Firebase Fallback
1. Uses Firebase's built-in email verification
2. Automatic fallback if custom server unavailable
3. Maintains compatibility

## User Experience

### Before Verification
- User registers for workshop
- Account is created but marked as "pending"
- User is redirected to verification pending page
- Can still access workshop details but may have limited functionality

### After Verification
- User clicks verification link in email
- Account status is updated to "verified"
- User is redirected to dashboard
- Full access to all platform features

## Integration Points

### Workshop Registration
- All workshop registration forms now include verification
- Consistent user experience across all registration methods
- Automatic redirect to verification pending page

### Login System
- Login checks verification status
- Unverified users redirected to verification pending page
- Verified users redirected to dashboard

### Admin Functions
- Admin user creation bypasses verification (for testing/management)
- Admin can manually verify users if needed

## Benefits

1. **Consistent Experience**: All registration methods use the same verification system
2. **Security**: Email verification ensures valid email addresses
3. **User Management**: Clear verification status tracking
4. **Flexibility**: Works with or without custom email server
5. **User-Friendly**: Clear guidance and status updates

## Testing

To test the workshop registration verification:

1. **Workshop Modal Registration**:
   - Go to workshops page
   - Click "Register" on any workshop
   - Choose "Create Account" option
   - Fill out registration form
   - Should redirect to verification pending page

2. **Direct Workshop Registration**:
   - Go to workshop details page
   - Click "Register for Workshop"
   - Fill out registration form
   - Should redirect to verification pending page

3. **Social Login Registration**:
   - Go to workshops page
   - Click "Register" on any workshop
   - Choose Google/Facebook/Yahoo login
   - Should redirect based on verification status

## Troubleshooting

### Common Issues

1. **Email not received**:
   - Check spam folder
   - Verify email address is correct
   - Check if custom email server is running

2. **Verification link not working**:
   - Ensure server is running on correct port
   - Check if token has expired (24 hours)
   - Verify URL is correct

3. **Registration stuck on pending**:
   - Check if email verification was sent
   - Verify user clicked verification link
   - Check database for verification status

### Debug Steps

1. Check browser console for errors
2. Verify Firebase Auth user status
3. Check Firestore user document
4. Test email verification manually
5. Check server logs for email sending issues 