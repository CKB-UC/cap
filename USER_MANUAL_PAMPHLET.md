<!--
UPSKILL User Manual Pamphlet (3 columns, 8.5in x 13in, max 2 pages)
This file contains full HTML to ensure precise print layout with md-to-pdf.
-->
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>UPSKILL User Manual – Pamphlet</title>
<style>
  @page { size: 8.5in 13in; margin: 0.3in; }
  html, body { height: 100%; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    font-size: 9pt;
    line-height: 1.25;
    column-count: 3;
    column-gap: 0.3in;
    column-fill: auto;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  h1, h2, h3 { break-after: avoid; break-inside: avoid; color: #0f172a; margin: 0.06in 0 0.04in; }
  h1 { font-size: 13pt; }
  h2 { font-size: 11pt; }
  h3 { font-size: 10pt; }
  p, li { margin: 0 0 0.06in; }
  ul { padding-left: 0.16in; margin: 0 0 0.06in; }
  .section { break-inside: avoid; }
  .muted { color: #475569; }
  .hr { border-top: 1px solid #cbd5e1; margin: 0.08in 0; break-inside: avoid; }
  .tiny { font-size: 8pt; }
</style>
</head>
<body>

<h1>UPSKILL User Manual – Quick Pamphlet</h1>
<p class="muted tiny">Format: 8.5" × 13" • 3 columns • Up to 2 pages • For Users and Admins</p>
<div class="hr"></div>

<div class="section">
  <h2>About UPSKILL</h2>
  <p>UPSKILL delivers soft‑skills workshops, an assessment, and guided learning with real‑time notifications and an admin suite.</p>
</div>

<div class="section">
  <h2>Getting Started (Users)</h2>
  <h3>Create Account</h3>
  <ul>
    <li>Go to <code>register.html</code> (or Sign Up).</li>
    <li>Enter Full Name, Email, Password, Birth Date (15+), Occupation, Phone, Government ID, Address, Emergency Contact.</li>
    <li>Submit to create your account and proceed to verification.</li>
  </ul>
  <h3>Email Verification</h3>
  <ul>
    <li>Click the link sent to your email to verify (opens <code>verify-email.html</code>).</li>
    <li>If needed, use “Resend Email Verification” on <code>verification-pending.html</code>.</li>
  </ul>
  <h3>Log In</h3>
  <ul>
    <li>Visit <code>login.html</code>. Verified users go to <code>index.html</code>.</li>
    <li>Unverified users are guided to <code>verification-pending.html</code>.</li>
  </ul>
</div>

<div class="section">
  <h2>Navigating the Site</h2>
  <ul>
    <li><strong>Home</strong>: <code>index.html</code> – assessment + featured ratings.</li>
    <li><strong>Workshops</strong>: <code>workshops.html</code> – browse/register, details, ratings.</li>
    <li><strong>About</strong>: <code>aboutus.html</code> – mission, services, clients.</li>
    <li><strong>Contact</strong>: <code>contact.html</code> – send inquiries.</li>
    <li><strong>Dashboard (admin)</strong>: <code>admin-dashboard.html</code></li>
    <li><strong>Notifications</strong>: bell icon after login; full page at <code>notifications.html</code>.</li>
  </ul>
</div>

<div class="section">
  <h2>Workshops</h2>
  <h3>Browse & Details</h3>
  <ul>
    <li>Grouped by status: Active, Upcoming, Postponed, Completed.</li>
    <li>Click a card for date/time, location, description, module objectives/materials, and video (if any).</li>
  </ul>
  <h3>Register</h3>
  <ul>
    <li>Upcoming/Postponed: click “Register Now”.</li>
    <li>If logged in: registration is saved if capacity allows; you see a success popup.</li>
    <li>If not logged in: a quick sign‑up modal creates your account and sends email verification.</li>
  </ul>
  <h3>Ratings & Comments</h3>
  <ul>
    <li>After completing a workshop you registered for, rate 1–5 and optionally comment.</li>
    <li>Recent testimonials appear on <code>index.html</code>.</li>
  </ul>
</div>

<div class="section">
  <h2>Notifications</h2>
  <ul>
    <li>Dropdown via bell icon; unread badge shows counts.</li>
    <li>Types: announcement, workshop_update, workshop_cancelled, workshop_reminder, system.</li>
    <li>Mark items as read, or “Mark All as Read”.</li>
    <li>Some allow replies to admins; see full list at <code>notifications.html</code>.</li>
  </ul>
</div>

<div class="section">
  <h2>Contact & Support</h2>
  <ul>
    <li>Use <code>contact.html</code> to send questions/feedback.</li>
    <li>If signed in: name/email auto‑fill; admins reply via in‑app notifications.</li>
  </ul>
</div>

<div class="section">
  <h2>Account Verification Status</h2>
  <ul>
    <li><code>verification-pending.html</code> shows steps: Email, Phone (simulated for now), Admin Review.</li>
    <li>Once verified, access all features normally.</li>
  </ul>
</div>

<div class="section">
  <h2>Admin Quick Guide</h2>
  <h3>Dashboard (<code>admin-dashboard.html</code>)</h3>
  <ul>
    <li>Stats: Total Users, Active Workshops, Registrations; mini trends; recent activity.</li>
    <li>Shortcuts: User Management, Workshops & Notifications, Contact, Verification, Analytics.</li>
  </ul>
  <h3>Workshops & Notifications</h3>
  <ul>
    <li>Create/update workshops (title, date/time, capacity, location, tags, status).</li>
    <li>Notify all/registered/specific users (priority: low–urgent).</li>
  </ul>
  <h3>Contact Management</h3>
  <ul>
    <li>View contact messages + notification replies together; filter; reply; delete; real‑time updates.</li>
  </ul>
  <h3>User Verification</h3>
  <ul>
    <li>Search/sort by status; approve/reject with timestamps and reasons.</li>
  </ul>
  <h3>Analytics</h3>
  <ul>
    <li>Registration trends, popularity by tag, demographics, CSV export.</li>
  </ul>
</div>

<div class="section">
  <h2>FAQ</h2>
  <ul>
    <li><strong>No verification email?</strong> Check spam; use Resend on <code>verification-pending.html</code>.</li>
    <li><strong>No bell icon?</strong> Log in; refresh if needed.</li>
    <li><strong>Cannot register?</strong> Workshop may be Active/full; log in or sign up first.</li>
    <li><strong>Admin access denied?</strong> Ensure your user has role <code>admin</code>.</li>
  </ul>
</div>

<div class="section">
  <h2>Troubleshooting</h2>
  <ul>
    <li>Login: verify email/password and email‑verified status.</li>
    <li>Verification link invalid/expired: resend from <code>verification-pending.html</code>.</li>
    <li>Notifications stale: refresh while logged in and online.</li>
    <li>Contact not delivered: retry; include alternate email.</li>
  </ul>
</div>

<div class="section">
  <h2>Policies & Help</h2>
  <ul>
    <li>Privacy: <code>privacy.html</code></li>
    <li>Terms: <code>terms.html</code></li>
    <li>Email: <code>info@upskill.com</code></li>
    <li>Address: Room 316 B, Lopez Building, Session Road, Baguio City 2600</li>
    <li>Phone: 0908‑340‑8351</li>
  </ul>
</div>

<div class="section">
  <h2>Quick Links</h2>
  <p class="tiny">
    Home: <code>index.html</code> • Workshops: <code>workshops.html</code> • About: <code>aboutus.html</code> • Contact: <code>contact.html</code> • Register: <code>register.html</code> • Login: <code>login.html</code> • Notifications: <code>notifications.html</code> • Verification: <code>verification-pending.html</code> • Verify Email: <code>verify-email.html</code> • Admin: <code>admin-dashboard.html</code> • User Verification: <code>user-verification.html</code> • Contact Mgmt: <code>contact-management.html</code> • Workshops & Notifications: <code>manage-workshops-notifications.html</code> • Analytics: <code>analytics.html</code>
  </p>
</div>

</body>
</html>