# Email Verification Setup Guide

This guide will help you set up Gmail email verification for the Workshop Platform.

## Prerequisites

1. A Gmail account
2. Node.js installed on your system
3. npm or yarn package manager

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Gmail

#### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

#### Step 2: Generate App Password
1. In Google Account settings, go to Security
2. Under "2-Step Verification", click on "App passwords"
3. Select "Mail" as the app and "Other" as the device
4. Click "Generate"
5. Copy the 16-character password that appears

### 3. Create Environment File

Create a `.env` file in the root directory with the following content:

```env
# Gmail Configuration
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-character-app-password

# Server Configuration
PORT=3000
```

**Important:** Replace `your-email@gmail.com` with your actual Gmail address and `your-16-character-app-password` with the App Password you generated.

### 4. Start the Server

```bash
# For development (with auto-restart)
npm run dev

# For production
npm start
```

The server will start on `http://localhost:3000`

## How It Works

### Registration Flow
1. User fills out registration form
2. Account is created in Firebase
3. Custom verification email is sent via Gmail SMTP
4. User receives email with verification link
5. User clicks link to verify email
6. Email verification status is updated in Firebase

### Email Verification Process
1. User clicks verification link in email
2. Link contains token and userId parameters
3. Server validates token and marks email as verified
4. User is redirected to dashboard

### Features
- ✅ Custom branded email templates
- ✅ Secure token-based verification
- ✅ 24-hour token expiration
- ✅ Resend verification functionality
- ✅ Integration with Firebase user system
- ✅ Beautiful verification confirmation page

## Troubleshooting

### Common Issues

1. **"Invalid login" error**
   - Make sure you're using an App Password, not your regular Gmail password
   - Ensure 2-factor authentication is enabled

2. **"Less secure app access" error**
   - This is expected - use App Passwords instead

3. **Emails not sending**
   - Check your Gmail credentials in the .env file
   - Verify your App Password is correct
   - Check server logs for detailed error messages

4. **Verification links not working**
   - Ensure the server is running on the correct port
   - Check that the verification URL in the email matches your server URL

### Security Notes

- Never commit your `.env` file to version control
- Use App Passwords instead of regular Gmail passwords
- Tokens expire after 24 hours for security
- All verification tokens are stored in memory (use a database in production)

## Production Deployment

For production deployment:

1. Use environment variables for all sensitive data
2. Store verification tokens in a database (Redis, MongoDB, etc.)
3. Use HTTPS for all verification links
4. Set up proper email delivery monitoring
5. Consider using a transactional email service like SendGrid or Mailgun for better deliverability

## Support

If you encounter any issues, check the server logs for detailed error messages. The system includes comprehensive error handling and user-friendly error messages. 