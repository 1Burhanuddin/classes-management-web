# Project Progress

Last updated: 2026-05-10

## Completed

### Foundation

- Next.js App Router scaffolded.
- Clerk installed and configured with `src/proxy.ts`.
- Clerk provider added in `src/app/layout.tsx`.
- Sign-in and sign-up routes added.
- Redux Toolkit and RTK Query base setup added.
- Prisma 7 configured for Neon PostgreSQL.
- Neon serverless SQL helper added for raw SQL health checks.
- Initial Prisma migration applied.
- Frappe LMS documented as a reference, not copied source.

### Auth And Roles

- `/admin/*`, `/teacher/*`, `/student/*`, and `/api/auth/me` require Clerk sign-in.
- Server layouts enforce database roles.
- `/api/auth/me` syncs signed-in Clerk users into the local `User` table.
- First admin can be promoted with:

```bash
npm run db:make-admin -- user@example.com
```

### Students Backend

- Student can now be created before linking a Clerk user.
- Prisma migration applied for optional `Student.userId`.
- Students validation added with Zod.
- Students service layer added.
- Students API routes added:

```txt
GET    /api/students
POST   /api/students
GET    /api/students/:id
PATCH  /api/students/:id
DELETE /api/students/:id
```

- RTK Query student endpoints added.
- Backend edge-case tests added for validation and service behavior.

### Classes Backend

- Classes validation added with Zod.
- Classes service layer added.
- Classes API routes added:

```txt
GET    /api/classes
POST   /api/classes
GET    /api/classes/:id
PATCH  /api/classes/:id
DELETE /api/classes/:id
```

- RTK Query class endpoints added in `src/store/api/classApi.ts`.
- Delete is guarded: classes with batches cannot be deleted.
- Backend edge-case tests added for validation and service behavior.

### Batches Backend

- Batches validation added with Zod.
- Batches service layer added.
- Batches API routes added:

```txt
GET    /api/batches
POST   /api/batches
GET    /api/batches/:id
PATCH  /api/batches/:id
DELETE /api/batches/:id
```

- RTK Query batch endpoints added.
- Create/update validates class existence.
- Create/update validates teacher existence when `teacherId` is provided.
- Delete is guarded: batches with students, assignments, announcements, or attendance cannot be deleted.
- Backend edge-case tests added for validation and service behavior.

### Teachers Backend

- Teachers validation added with Zod.
- Teachers service layer added.
- Teachers API routes added:

```txt
GET    /api/teachers
POST   /api/teachers
GET    /api/teachers/:id
PATCH  /api/teachers/:id
DELETE /api/teachers/:id
```

- RTK Query teacher endpoints added.
- Teacher profile creation requires an existing `User`.
- Creating/linking a teacher promotes the linked user to `TEACHER`.
- Admin users cannot be linked to teacher profiles.
- Users already linked to student or teacher profiles cannot be reused.
- Delete is guarded: teachers with batches cannot be deleted.
- Backend edge-case tests added for validation and service behavior.

### Attendance Backend

- Attendance validation added with Zod.
- Attendance service layer added.
- Attendance API routes added:

```txt
GET    /api/attendance
POST   /api/attendance
GET    /api/attendance/:id
PATCH  /api/attendance/:id
DELETE /api/attendance/:id
```

- RTK Query attendance endpoints added.
- Attendance dates are accepted as `YYYY-MM-DD` and normalized to UTC midnight.
- `ADMIN` can read and manage all attendance.
- `TEACHER` can read and manage attendance only for assigned batches.
- `STUDENT` can read only their own attendance.
- Create is guarded against duplicate student, batch, and date records.
- Create is guarded so the student must belong to the selected batch.
- Backend edge-case tests added for validation and service behavior.

### Assignments Backend

- Assignments validation added with Zod.
- Assignments service layer added.
- Assignments API routes added:

```txt
GET    /api/assignments
POST   /api/assignments
GET    /api/assignments/:id
PATCH  /api/assignments/:id
DELETE /api/assignments/:id
```

- RTK Query assignment endpoints added.
- Assignment due dates are accepted as `YYYY-MM-DD` and normalized to UTC midnight.
- Assignment file uploads stay external; API stores `fileUrl` only.
- `ADMIN` can read and manage all assignments.
- `TEACHER` can read and manage assignments only for assigned batches.
- `STUDENT` can read assignments only for their own batch.
- Create/update validates batch existence.
- Backend edge-case tests added for validation and service behavior.

## Verification

Latest checks:

```bash
npm test
npm run lint
npm run build
```

Current test coverage:

- Student validation rejects invalid UUIDs.
- Student validation rejects short names.
- Student validation rejects suspicious phone values.
- Student update rejects empty payloads.
- Student list validation caps page size.
- Student service rejects missing batches.
- Student service rejects missing linked users.
- Student service rejects users already linked to another student.
- Student service verifies pagination behavior.
- Class validation rejects short names.
- Class validation rejects empty updates.
- Class validation caps page size.
- Class service rejects missing records.
- Class service rejects deletes when batches exist.
- Batch validation rejects invalid time strings.
- Batch validation rejects empty updates.
- Batch validation caps page size.
- Batch service rejects missing classes.
- Batch service rejects missing teachers.
- Batch service rejects deletes when dependent records exist.
- Teacher validation rejects invalid user ids.
- Teacher validation rejects empty updates and normalized-empty updates.
- Teacher validation caps page size.
- Teacher service rejects missing users.
- Teacher service rejects admin users.
- Teacher service rejects users already linked to student or teacher profiles.
- Teacher service verifies role promotion on create.
- Teacher service rejects deletes when batches exist.
- Attendance validation rejects invalid dates.
- Attendance validation rejects invalid statuses.
- Attendance validation rejects empty updates and normalized-empty updates.
- Attendance service rejects unassigned teacher writes.
- Attendance service rejects student writes.
- Attendance service rejects student and batch mismatches.
- Attendance service rejects duplicate attendance.
- Attendance service limits student reads to their own attendance.
- Assignment validation rejects short titles.
- Assignment validation rejects invalid file URLs.
- Assignment validation rejects impossible due dates.
- Assignment validation rejects empty updates and normalized-empty updates.
- Assignment validation caps page size.
- Assignment service rejects unassigned teacher writes.
- Assignment service rejects student writes.
- Assignment service limits student reads to their own batch.

## Next Work

Recommended next backend steps:

1. Add Announcements module API.
2. Add Fees module API.
3. Add endpoint-level tests for route responses once test auth helpers are introduced.
4. Start UI only after the UI kit is provided.

## Notes For Other Developers

- Use Prisma for normal CRUD.
- Use `src/lib/neon.ts` only for health checks or direct SQL cases.
- Keep role checks in middleware, server layouts, API routes, or auth helpers.
- Do not hardcode role business logic inside components.
- Keep feature files under `src/features/<feature>`.
- Add edge-case tests whenever adding backend APIs.
