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

## Next Work

Recommended next backend steps:

1. Add Classes module API.
2. Add Batches module API.
3. Add Teacher module API.
4. Add endpoint-level tests for route responses once test auth helpers are introduced.
5. Start UI only after the UI kit is provided.

## Notes For Other Developers

- Use Prisma for normal CRUD.
- Use `src/lib/neon.ts` only for health checks or direct SQL cases.
- Keep role checks in middleware, server layouts, API routes, or auth helpers.
- Do not hardcode role business logic inside components.
- Keep feature files under `src/features/<feature>`.
- Add edge-case tests whenever adding backend APIs.
