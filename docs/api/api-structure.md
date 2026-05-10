# API Structure

All API work should follow this flow:

```txt
Route Handler
  -> Controller or request handler
  -> Service
  -> Prisma
  -> PostgreSQL
```

For this project, a "controller" can be a small function inside the route file or a separate file when the route becomes large. The service layer is required for business logic.

## API Routes

```txt
/api/students
/api/teachers
/api/classes
/api/batches
/api/attendance
/api/assignments
/api/announcements
/api/fees
```

## Implemented APIs

Students:

```txt
GET    /api/students
POST   /api/students
GET    /api/students/:id
PATCH  /api/students/:id
DELETE /api/students/:id
```

Current access: `ADMIN`.

Classes:

```txt
GET    /api/classes
POST   /api/classes
GET    /api/classes/:id
PATCH  /api/classes/:id
DELETE /api/classes/:id
```

Current access: `ADMIN`.

Batches:

```txt
GET    /api/batches
POST   /api/batches
GET    /api/batches/:id
PATCH  /api/batches/:id
DELETE /api/batches/:id
```

Current access: `ADMIN`.

Teachers:

```txt
GET    /api/teachers
POST   /api/teachers
GET    /api/teachers/:id
PATCH  /api/teachers/:id
DELETE /api/teachers/:id
```

Current access: `ADMIN`.

Attendance:

```txt
GET    /api/attendance
POST   /api/attendance
GET    /api/attendance/:id
PATCH  /api/attendance/:id
DELETE /api/attendance/:id
```

Current access:

- `ADMIN`: read and manage all attendance.
- `TEACHER`: read and manage attendance for assigned batches only.
- `STUDENT`: read own attendance only.

Assignments:

```txt
GET    /api/assignments
POST   /api/assignments
GET    /api/assignments/:id
PATCH  /api/assignments/:id
DELETE /api/assignments/:id
```

Current access:

- `ADMIN`: read and manage all assignments.
- `TEACHER`: read and manage assignments for assigned batches only.
- `STUDENT`: read assignments for own batch only.

Announcements:

```txt
GET    /api/announcements
POST   /api/announcements
GET    /api/announcements/:id
PATCH  /api/announcements/:id
DELETE /api/announcements/:id
```

Current access:

- `ADMIN`: read and manage all announcements.
- `TEACHER`: read and manage announcements for assigned batches only.
- `STUDENT`: read announcements for own batch only.

## Request Pattern

1. Route handler receives the request.
2. Auth helper reads Clerk user and database role.
3. Zod validates request params, query, and body.
4. Route handler calls the feature service.
5. Service handles business rules and Prisma calls.
6. Route handler returns a consistent JSON response.

## Example Module Flow

```txt
src/app/api/students/route.ts
  -> src/features/students/student.service.ts
  -> src/features/students/validation/student.schema.ts
  -> src/lib/prisma.ts
```

## Database Access

Use Prisma for normal application data access:

```txt
Route Handler -> Feature Service -> Prisma -> Neon PostgreSQL
```

Use the Neon serverless SQL helper only for small raw SQL needs, health checks, or queries that are clearer as direct SQL:

```txt
src/lib/neon.ts
src/app/actions.ts
src/app/api/health/db/route.ts
```

Do not use raw SQL for standard CRUD unless Prisma is a poor fit for that query.

## Neon Connection Strings

Use both Neon connection strings when available:

- `DATABASE_URL`: pooled Neon connection for app runtime queries.
- `DATABASE_DIRECT_URL`: direct Neon connection for Prisma migrations.

If Prisma migration fails against a Neon host that contains `-pooler`, add the direct connection string from the Neon dashboard as `DATABASE_DIRECT_URL`.

## Response Rules

- Use UUID ids everywhere.
- Keep APIs modular by feature.
- Do not put Prisma queries directly inside UI components.
- Do not put complex business rules directly inside route handlers.
- Return clear validation errors from Zod.
- Return authorization errors before running service operations.
- Store uploaded files externally and save only metadata or public URLs in the database.

## File Storage

Use external storage for files:

- Cloudinary for images and media.
- Supabase Storage for documents, notes, assignments, and general file uploads.

Do not store uploaded files in the repository or database.
