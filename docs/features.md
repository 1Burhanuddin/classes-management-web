# Features

This is not an ERP. The goal is a usable MVP with a scalable architecture, modular codebase, and AI IDE friendly patterns.

## Core Roles

### Admin

- Create classes
- Create batches
- Add students
- Add teachers
- Manage fees
- Publish announcements
- View dashboard analytics

### Teacher

- Take attendance
- Upload assignments
- Upload notes
- View assigned students and batches
- Publish announcements for assigned batches

### Student

- View attendance
- View assignments
- View announcements
- View fees
- View schedule

## Validation

Use:

- Zod
- React Hook Form

Validation must exist in both places:

- Frontend forms, for fast user feedback.
- Backend API routes, for security and data correctness.

Keep shared validation schemas in feature folders when they belong to one module, for example `src/features/students/validation`. Put truly global schemas in `src/validation`.

## Important Development Rules

1. Use UUID everywhere.
2. Keep APIs modular.
3. Never hardcode role logic in components.
4. Use the service layer.
5. Use reusable tables and forms.
6. Keep feature-based architecture.
7. Store files externally.

## Avoid

- Over engineering
- Unnecessary animations
- Complex dashboards initially
- Building future ERP features before the MVP works

## Future Scaling Ideas

Do not build these during the MVP, but keep the architecture ready for them:

- WhatsApp integration
- Notifications
- Parent portal
- Timetable generation
- Payment gateway
- AI analytics
- Mobile app
- Multi institute support
