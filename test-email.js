const nodemailer = require('nodemailer');
require('dotenv').config();

// Test email configuration
async function testEmail() {
    console.log('Testing Gmail SMTP configuration...');
    
    // Check if environment variables are set
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
        console.error('❌ Environment variables not set!');
        console.log('Please create a .env file with:');
        console.log('GMAIL_USER=your-email@gmail.com');
        console.log('GMAIL_APP_PASSWORD=your-app-password');
        return;
    }
    
    console.log('✅ Environment variables found');
    console.log('📧 Gmail User:', process.env.GMAIL_USER);
    console.log('🔑 App Password:', process.env.GMAIL_APP_PASSWORD ? '***' + process.env.GMAIL_APP_PASSWORD.slice(-4) : 'Not set');
    
    // Create transporter
    const transporter = nodemailer.createTransporter({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD
        }
    });
    
    try {
        // Verify connection
        console.log('🔍 Verifying SMTP connection...');
        await transporter.verify();
        console.log('✅ SMTP connection successful!');
        
        // Send test email
        console.log('📤 Sending test email...');
        const mailOptions = {
            from: process.env.GMAIL_USER,
            to: process.env.GMAIL_USER, // Send to yourself for testing
            subject: 'Test Email - Workshop Platform',
            html: `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Test Email</title>
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
                        .success {
                            background: #d4edda;
                            border: 1px solid #c3e6cb;
                            color: #155724;
                            padding: 15px;
                            border-radius: 5px;
                            margin: 20px 0;
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>🎉 Email Test Successful!</h1>
                        <p>Workshop Platform Email Verification System</p>
                    </div>
                    
                    <div class="content">
                        <h2>Test Email Configuration</h2>
                        <p>This is a test email to verify that your Gmail SMTP configuration is working correctly.</p>
                        
                        <div class="success">
                            <strong>✅ Success!</strong> Your email verification system is properly configured and ready to use.
                        </div>
                        
                        <h3>What this means:</h3>
                        <ul>
                            <li>✅ Gmail SMTP is working</li>
                            <li>✅ App Password is valid</li>
                            <li>✅ Email templates will render correctly</li>
                            <li>✅ Users will receive verification emails</li>
                        </ul>
                        
                        <p><strong>Next steps:</strong> Start your server with <code>npm start</code> and test the full registration flow.</p>
                    </div>
                </body>
                </html>
            `
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Test email sent successfully!');
        console.log('📧 Message ID:', info.messageId);
        console.log('📬 Check your inbox for the test email');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        if (error.code === 'EAUTH') {
            console.log('\n🔧 Troubleshooting tips:');
            console.log('1. Make sure 2-factor authentication is enabled on your Google account');
            console.log('2. Generate a new App Password from Google Account settings');
            console.log('3. Use the App Password, not your regular Gmail password');
            console.log('4. Check that your .env file has the correct credentials');
        }
    }
}

// Run the test
testEmail(); 