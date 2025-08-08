const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Store verification tokens (in production, use a database)
const verificationTokens = new Map();

// Gmail SMTP configuration
let transporter = null;

// Only create transporter if Gmail credentials are configured
if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
    console.log('✅ Gmail SMTP configured successfully');
} else {
    console.log('⚠️  Gmail credentials not configured. Email verification will use Firebase fallback.');
    console.log('   To enable custom emails, create a .env file with GMAIL_USER and GMAIL_APP_PASSWORD');
}

// Generate verification token
function generateVerificationToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Send verification email
app.post('/api/send-verification-email', async (req, res) => {
    try {
        const { email, userId, userName } = req.body;
        
        if (!email || !userId || !userName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if Gmail transporter is configured
        if (!transporter) {
            return res.status(503).json({ 
                error: 'Email service not configured',
                message: 'Gmail credentials not set up. Please configure GMAIL_USER and GMAIL_APP_PASSWORD in .env file'
            });
        }

        // Generate verification token
        const token = generateVerificationToken();
        const verificationUrl = `http://localhost:${PORT}/verify-email.html?token=${token}&userId=${userId}`;
        
        // Store token with expiration (24 hours)
        verificationTokens.set(token, {
            userId,
            email,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        });

        // Email template
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: email,
            subject: 'Verify Your Email - Workshop Platform',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Verification</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f8f9fa;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .button {
                            display: inline-block;
                            background: #007bff;
                            color: white;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .button:hover {
                            background: #0056b3;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            color: #666;
                            font-size: 14px;
                        }
                        .warning {
                            background: #fff3cd;
                            border: 1px solid #ffeaa7;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Welcome to Workshop Platform!</h1>
                        <p>Hi ${userName}, please verify your email address</p>
                    </div>
                    
                    <div class="content">
                        <h2>Email Verification Required</h2>
                        <p>Thank you for registering with Workshop Platform! To complete your registration and access all features, please verify your email address by clicking the button below:</p>
                        
                        <div style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </div>
                        
                        <div class="warning">
                            <strong>Important:</strong> This verification link will expire in 24 hours. If you don't verify your email within this time, you'll need to request a new verification link.
                        </div>
                        
                        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
                        
                        <p>If you didn't create an account with Workshop Platform, you can safely ignore this email.</p>
                    </div>
                    
                    <div class="footer">
                        <p>This email was sent by Workshop Platform</p>
                        <p>If you have any questions, please contact our support team</p>
                    </div>
                </body>
                </html>
            `
        };

        // Send email
        await transporter.sendMail(mailOptions);
        
        res.json({ 
            success: true, 
            message: 'Verification email sent successfully' 
        });

    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).json({ 
            error: 'Failed to send verification email',
            details: error.message 
        });
    }
});

// Verify email endpoint
app.get('/api/verify-email', (req, res) => {
    const { token, userId } = req.query;
    
    if (!token || !userId) {
        return res.status(400).json({ error: 'Missing token or userId' });
    }

    const tokenData = verificationTokens.get(token);
    
    if (!tokenData) {
        return res.status(400).json({ error: 'Invalid or expired token' });
    }

    if (tokenData.userId !== userId) {
        return res.status(400).json({ error: 'Token mismatch' });
    }

    if (Date.now() > tokenData.expiresAt) {
        verificationTokens.delete(token);
        return res.status(400).json({ error: 'Token has expired' });
    }

    // Token is valid - remove it and return success
    verificationTokens.delete(token);
    
    res.json({ 
        success: true, 
        message: 'Email verified successfully',
        userId: userId
    });
});

// Resend verification email
app.post('/api/resend-verification', async (req, res) => {
    try {
        const { email, userId, userName } = req.body;
        
        if (!email || !userId || !userName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Generate new token
        const token = generateVerificationToken();
        const verificationUrl = `http://localhost:${PORT}/verify-email.html?token=${token}&userId=${userId}`;
        
        // Store new token
        verificationTokens.set(token, {
            userId,
            email,
            expiresAt: Date.now() + (24 * 60 * 60 * 1000)
        });

        // Send new verification email
        const mailOptions = {
            from: process.env.GMAIL_USER || 'your-email@gmail.com',
            to: email,
            subject: 'Email Verification - Workshop Platform',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Email Verification</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            line-height: 1.6;
                            color: #333;
                            max-width: 600px;
                            margin: 0 auto;
                            padding: 20px;
                        }
                        .header {
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            color: white;
                            padding: 30px;
                            text-align: center;
                            border-radius: 10px 10px 0 0;
                        }
                        .content {
                            background: #f8f9fa;
                            padding: 30px;
                            border-radius: 0 0 10px 10px;
                        }
                        .button {
                            display: inline-block;
                            background: #007bff;
                            color: white;
                            padding: 15px 30px;
                            text-decoration: none;
                            border-radius: 5px;
                            margin: 20px 0;
                            font-weight: bold;
                        }
                        .button:hover {
                            background: #0056b3;
                        }
                        .footer {
                            text-align: center;
                            margin-top: 30px;
                            color: #666;
                            font-size: 14px;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>Email Verification</h1>
                        <p>Hi ${userName}, here's your new verification link</p>
                    </div>
                    
                    <div class="content">
                        <h2>New Verification Link</h2>
                        <p>You requested a new email verification link. Click the button below to verify your email address:</p>
                        
                        <div style="text-align: center;">
                            <a href="${verificationUrl}" class="button">Verify Email Address</a>
                        </div>
                        
                        <p>If the button above doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #007bff;">${verificationUrl}</p>
                        
                        <p>This link will expire in 24 hours.</p>
                    </div>
                    
                    <div class="footer">
                        <p>This email was sent by Workshop Platform</p>
                    </div>
                </body>
                </html>
            `
        };

        await transporter.sendMail(mailOptions);
        
        res.json({ 
            success: true, 
            message: 'New verification email sent successfully' 
        });

    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ 
            error: 'Failed to resend verification email',
            details: error.message 
        });
    }
});

// Serve the verification page
app.get('/verify-email.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'verify-email.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Verification page: http://localhost:${PORT}/verify-email.html`);
});

module.exports = app; 