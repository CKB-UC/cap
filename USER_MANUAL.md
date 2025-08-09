# UPSKILL User Manual

A practical guide for users and administrators of the UPSKILL Soft Skills Development Platform.

- Audience: End Users (participants) and Admins
- Platform: Web (desktop and mobile browsers)
- Key Pages: `index.html`, `workshops.html`, `aboutus.html`, `contact.html`, `login.html`, `register.html`, `notifications.html`, `admin-dashboard.html`

---

## 1) About UPSKILL
UPSKILL helps users strengthen soft skills through interactive workshops, assessments, and guided learning. The platform provides real-time notifications, a contact and support channel, and an admin suite for managing users, workshops, and analytics.

---

## 2) Getting Started

### 2.1 Create an Account
- Navigate to Sign Up from the top navigation or visit `register.html`.
- Complete the form: Full Name, Email, Password, Birth Date (must be 15+), Occupation, Phone, Government ID, Address, Emergency Contact.
- Submit to create your account.

What happens next:
- You’ll be redirected to the verification page (`verification-pending.html`).
- A verification email is sent automatically. If the custom mail server is unavailable, the platform falls back to Firebase’s built-in verification.

### 2.2 Verify Your Email
- Open the verification email and click the link.
- The link opens `verify-email.html` and confirms your email.
- On success, you’ll be redirected to the home page.
- If needed, use “Resend Email Verification” on `verification-pending.html`.

### 2.3 Log In
- Go to `login.html`.
- Enter your registered email and password.
- If your email is verified, you’ll be redirected to `index.html`.
- If verification is still pending, you’ll be redirected to `verification-pending.html` with guidance.

---

## 3) Navigating the Site

Global navigation (top bar):
- Home: `index.html`
- Workshops: `workshops.html`
- About Us: `aboutus.html`
- Contact: `contact.html`
- Dashboard (admins only): `admin-dashboard.html`
- Auth: Log In / Sign Up buttons (hidden after login)

Other helpers:
- Chatbot: floating assistant icon on supported pages to help with navigation.
- Notifications: bell icon appears after login (top-right). Shows unread count, dropdown list, and toasts.

---

## 4) Workshops

### 4.1 Browse and Discover
- Visit `workshops.html` to see workshops grouped by status: Active, Upcoming, Postponed, Completed.
- Click a workshop card to open detailed view (date/time, location, description, objectives, prerequisites, materials, and any video).

### 4.2 Register for a Workshop
- For Upcoming/Postponed workshops: click “Register Now”.
- If logged in:
  - Registration is added to your account if capacity allows.
  - You’ll see a success confirmation, and the button changes to “Contact Us”.
- If not logged in:
  - A registration form appears to create an account and register in one flow.
  - Email verification is required; you’ll be redirected to `verification-pending.html`.

Notes:
- Capacity is enforced. If a workshop is full, you’ll be notified.
- “Active” workshops cannot be registered from this view (displayed as in-progress).

### 4.3 Ratings and Comments (Completed Workshops)
- If you registered and the workshop is completed:
  - You may rate (1–5 stars) and optionally leave a comment.
  - You can view your rating and recent comments.
- The home page (`index.html`) showcases recent testimonials and ratings.

---

## 5) Notifications

### 5.1 Where to Find Notifications
- After logging in, a bell icon appears in the top navigation.
- Unread count is shown on a badge. Click the bell to open the dropdown.
- For a full-page view, go to `notifications.html`.

### 5.2 Using Notifications
- View items in the dropdown or on `notifications.html`.
- Click an item to mark as read.
- Use “Mark All as Read” to clear unread items.
- Filter notifications by type on `notifications.html` (announcement, workshop updates, reminders, system).
- Some notifications allow reply. Click “Reply” to send a message back to admins.

---

## 6) Contact and Support

### 6.1 Contact Page
- Visit `contact.html` to send a message.
- If logged in: name and email are inferred from your account and fields are hidden.
- If logged out: fill in name, email, subject, and message.
- After sending, you’ll see a success message.

### 6.2 Response from Admins
- Admins review your message in their Contact Management page.
- Admin replies are delivered to you as in-app notifications.

---

## 7) Account Verification Status

`verification-pending.html` helps you track:
- Email Verification: resend email if needed.
- Phone Verification: a simulated process for now; when available, you’ll verify via SMS.
- Admin Review: once your information is reviewed, your status updates.

When your email is verified (and where applicable phone/admin review), your account status becomes “verified,” and you can access all features.

---

## 8) Admin Guide

Only users with the `admin` role can access admin features.

### 8.1 Admin Dashboard
- URL: `admin-dashboard.html`
- Overview cards: Total Users, Active Workshops, Total Registrations
- Registration Trends mini-chart
- Quick access tiles:
  - User Management: `user-management.html`
  - Workshops & Notifications: `manage-workshops-notifications.html`
  - Contact Management: `contact-management.html`
  - Verification Management: `user-verification.html`
  - Analytics: `analytics.html`
- Recent Activity table with pagination and Clear Activity button

### 8.2 Workshops & Notifications
- URL: `manage-workshops-notifications.html`
- Create and manage workshops (title, description, date/time, capacity, location, tags, status).
- Create and manage notifications:
  - Types: announcement, workshop_update, workshop_cancelled, workshop_reminder, system
  - Priority: low, medium, high, urgent
  - Target users: all, registered, or specific user IDs (e.g., registeredUsers of a workshop)

### 8.3 Contact Management
- URL: `contact-management.html`
- Tabs:
  - All Messages & Replies: contact form messages + user replies to notifications (in one view)
  - Notification Replies Only: filtered user replies
- Features:
  - Filters (status, date range), refresh, mark all as read
  - Reply to contact messages; reply is also sent as a notification when a matching user account is found
  - Reply to user notification replies (sends a new admin reply notification to the user)
  - Delete messages or replies
  - Real-time listeners for new messages/replies

### 8.4 User Verification Management
- URL: `user-verification.html`
- View users by status (pending/verified/rejected), search, and sort.
- Review details (phone, occupation, government ID, address, emergency contact).
- Approve (mark verified) or Reject (with reason). Status and timestamps are stored.

### 8.5 Analytics
- URL: `analytics.html`
- Cards: Registration Rate (avg per active workshop), Completion Rate, User Growth
- Charts:
  - Registration Trends (new user registrations and logins)
  - Workshop Popularity (avg rating by tag and workshop count)
  - User Demographics (student, employed, unemployed, other)
- Time range selector and CSV data export

---

## 9) Frequently Asked Questions (FAQ)

- I didn’t receive a verification email.
  - Check spam/junk. On `verification-pending.html`, click “Resend Email Verification.”
- I can’t see the notification bell.
  - You must be logged in. If logged in but still not visible, refresh the page and ensure your internet connection is stable.
- I can’t register for a workshop.
  - Registration is disabled if the workshop is “Active” or at capacity. If you’re not logged in, complete the sign-up flow first.
- My admin pages say I’m not authorized.
  - Your user must have the `admin` role. Contact an existing admin to grant access.

---

## 10) Troubleshooting

- Login issues: ensure correct email/password and that your email has been verified.
- Verification link invalid/expired: request a new verification email from `verification-pending.html`.
- Notifications not updating: refresh the page; ensure you’re logged in and online.
- Contact messages not delivered: try again; if the issue persists, include an alternate email in the message body.

---

## 11) Privacy & Terms

- Privacy Policy: `privacy.html`
- Terms of Service: `terms.html`

---

## 12) Support

- Email: info@upskill.com
- Address: Room 316 B, Lopez Building, Session Road, Baguio City 2600
- Phone: 0908-340-8351

---

## 13) Quick Reference (Pages)

- Home: `index.html`
- Workshops: `workshops.html`
- About Us: `aboutus.html`
- Contact: `contact.html`
- Register: `register.html`
- Login: `login.html`
- Notifications (user): `notifications.html`
- Verification Pending: `verification-pending.html`
- Verify Email: `verify-email.html`
- Admin Dashboard: `admin-dashboard.html`
- User Management: `user-management.html`
- Workshops & Notifications: `manage-workshops-notifications.html`
- Contact Management: `contact-management.html`
- User Verification Management: `user-verification.html`
- Analytics: `analytics.html`