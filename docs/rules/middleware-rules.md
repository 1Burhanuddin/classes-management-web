# Middleware And Permission Rules

Middleware protects route groups. Role checks should be centralized in helpers, not hardcoded inside components.

## Route Access

```txt
/admin/*   -> ADMIN only
/teacher/* -> TEACHER and ADMIN
/student/* -> STUDENT and ADMIN
```

## Role Permissions

### Admin

- Full access to MVP modules.
- Can manage students, teachers, classes, batches, fees, announcements, and dashboard data.

### Teacher

- Can manage attendance for assigned batches.
- Can create assignments for assigned batches.
- Can create announcements for assigned batches.
- Can view students in assigned batches.

### Student

- Read-only access to personal data.
- Can view own attendance, assignments, announcements, fees, and schedule.

## Rules

- Middleware should handle route-level protection.
- API route handlers should still check permissions before calling services.
- Components should receive permissions or derived booleans from hooks/helpers.
- Components must not contain hardcoded role business logic.
- Services should verify ownership rules, for example teacher access to assigned batches.

## Current Implementation

- Clerk middleware requires sign-in for `/admin/*`, `/teacher/*`, `/student/*`, and `/api/auth/me`.
- Database role checks happen in server layouts and API helpers.
- Admin routes allow only `ADMIN`.
- Teacher routes allow `ADMIN` and `TEACHER`.
- Student routes allow `ADMIN` and `STUDENT`.
