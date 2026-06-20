QR Event Attendance Management System (MVP)
Technical Requirements Document (TRD)
Version: 1.0
1. Project Overview
Create a simple QR-based attendance management system that allows organizations, schools,
event organizers, and institutions to register participants, generate unique QR codes, scan
attendance using QR readers, and manage check-in/check-out records.
2. Business Goal
Many events still manage attendance manually. This solution automates participant registration, QR
generation, attendance tracking, and reporting.
3. MVP Scope
Included: User Management, QR Generation, QR Scanning, Check-In/Check-Out, Attendance
Logs, Admin Dashboard.
4. User Roles
Participant: Register, View QR. Admin: Manage users, events, attendance, dashboard.
5. System Flow
Register → Generate QR → Show QR → Scan QR → Attendance Recorded
6. Core Features
• Participant Registration
• Automatic QR Generation
• QR Scan Validation
• Check-In / Check-Out Logic
• Attendance History
• Admin Dashboard
7. Attendance Logic
First Scan = Check-In
Second Scan = Check-Out
Third Scan = Warning: Already Checked Out
8. Event Management
Admin can create events with title, date, location and description.
9. Admin Dashboard
Dashboard shows: Total Participants, Checked-In, Checked-Out, Currently Inside, Recent
Attendance Records.
10. Database Design
users(id, name, phone, organization, photo_url, qr_token)
events(id, title, description, location, event_date)
attendance(id, user_id, event_id, check_in_time, check_out_time, status)
11. API Endpoints
POST /api/users
GET /api/users/:id
GET /api/users/:id/qr
POST /api/attendance/scan
GET /api/attendance
POST /api/events
GET /api/events
12. Recommended Tech Stack
Frontend: React, Vite, TypeScript, Ant Design
Backend: Node.js, Express.js, PostgreSQL, Prisma
QR Libraries: qrcode, html5-qrcode
13. Future SaaS Version
Multi-Organization Support
Subscription Plans
Ticketing System
Exhibition Tracking
Education Center Attendance
14. MVP Success Criteria
✓ User Registration
✓ QR Generation
✓ QR Scanning
✓ Check-In / Check-Out
✓ Attendance Logs
✓ Dashboard Statistics
Estimated Development Time: 2–3 DaysQR Event Attendance Management System (MVP)
Technical Requirements Document (TRD)
Version: 1.0
1. Project Overview
Create a simple QR-based attendance management system that allows organizations, schools,
event organizers, and institutions to register participants, generate unique QR codes, scan
attendance using QR readers, and manage check-in/check-out records.
2. Business Goal
Many events still manage attendance manually. This solution automates participant registration, QR
generation, attendance tracking, and reporting.
3. MVP Scope
Included: User Management, QR Generation, QR Scanning, Check-In/Check-Out, Attendance
Logs, Admin Dashboard.
4. User Roles
Participant: Register, View QR. Admin: Manage users, events, attendance, dashboard.
5. System Flow
Register → Generate QR → Show QR → Scan QR → Attendance Recorded
6. Core Features
• Participant Registration
• Automatic QR Generation
• QR Scan Validation
• Check-In / Check-Out Logic
• Attendance History
• Admin Dashboard
7. Attendance Logic
First Scan = Check-In
Second Scan = Check-Out
Third Scan = Warning: Already Checked Out
8. Event Management
Admin can create events with title, date, location and description.
9. Admin Dashboard
Dashboard shows: Total Participants, Checked-In, Checked-Out, Currently Inside, Recent
Attendance Records.
10. Database Design
users(id, name, phone, organization, photo_url, qr_token)
events(id, title, description, location, event_date)
attendance(id, user_id, event_id, check_in_time, check_out_time, status)
11. API Endpoints
POST /api/users
GET /api/users/:id
GET /api/users/:id/qr
POST /api/attendance/scan
GET /api/attendance
POST /api/events
GET /api/events
12. Recommended Tech Stack
Frontend: React, Vite, TypeScript, Ant Design
Backend: Node.js, Express.js, PostgreSQL, Prisma
QR Libraries: qrcode, html5-qrcode
13. Future SaaS Version
Multi-Organization Support
Subscription Plans
Ticketing System
Exhibition Tracking
Education Center Attendance
14. MVP Success Criteria
✓ User Registration
✓ QR Generation
✓ QR Scanning
✓ Check-In / Check-Out
✓ Attendance Logs
✓ Dashboard Statistics
Estimated Development Time: 2–3 Days