# Frappe LMS Reference

Reference repository: https://github.com/frappe/lms

Use this repository as product and architecture inspiration only. Do not copy source files into this project without an explicit license decision.

## License Note

Frappe LMS is licensed under AGPL-3.0. That is a strong copyleft license for network software. For this project, use it as a reference for concepts, flows, and module boundaries, then implement our own Next.js, Prisma, Clerk, and RTK Query code.

## What To Learn From It

### Backend Concepts

Frappe LMS organizes the domain around document-style modules. Useful concepts for our app:

- Batch
- Course or class content
- Enrollment
- Assignment
- Assignment submission
- Quiz
- Quiz submission/result
- Live class
- Timetable
- Certificate
- Payment
- Progress tracking
- Settings

For our MVP, keep the domain smaller:

- Students
- Teachers
- Classes
- Batches
- Attendance
- Assignments
- Announcements
- Fees

Only add quizzes, certificates, live classes, and progress tracking after the MVP is stable.

### Frontend Concepts

Frappe LMS separates reusable interface pieces from page modules. Useful patterns:

- Layout components
- Empty state components
- Modal-based create/edit flows
- Upload controls
- Autocomplete and link controls
- Batch detail pages with tabs/sections
- Course or batch overview pages
- Student progress views

For our app, map these into:

- `src/components/shared`
- `src/components/layouts`
- `src/features/<feature>/components`
- `src/features/<feature>/hooks`

## Mapping To Our Architecture

| Frappe LMS idea | Our MVP equivalent |
| --- | --- |
| LMS Batch | Batch |
| LMS Enrollment | Student assigned to Batch |
| LMS Assignment | Assignment |
| Assignment Submission | Future assignment submission module |
| Live Class | Future timetable/live class module |
| Quiz | Future assessment module |
| Certificate | Future certificate module |
| Payment | Fees |
| Course Progress | Future analytics/progress module |

## Development Rules From This Reference

- Keep modules independent.
- Keep batch as a central concept.
- Keep enrollment/assignment/payment records separate from user identity.
- Use reusable modal and form patterns.
- Use reusable table/list patterns.
- Add dashboard analytics later, not before CRUD and permissions work.
- Keep future learning features possible without forcing them into the MVP schema too early.

## What Not To Bring In Yet

- Frappe Framework patterns
- Vue components
- Frappe UI code
- Payments beyond basic fees
- Certificates
- Quizzes
- Live class provider integrations
- Full LMS content hierarchy

This project is a classes management MVP, not a full LMS.
