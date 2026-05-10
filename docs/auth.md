# Authentication

Use Clerk for authentication and the local database for application roles.

```txt
Google login
  -> Clerk authentication
  -> Create or find User in database
  -> Assign role
  -> Protect routes and APIs
```

## User Source Of Truth

- Clerk owns identity: login, email, session, provider.
- PostgreSQL owns app profile and role: `ADMIN`, `TEACHER`, `STUDENT`.
- The database `User` record should store `clerkId` and application role.

## Role Handling

- Route middleware checks role before loading protected route groups.
- API routes check role before service calls.
- Services check ownership rules where needed.
- UI components should use permission helpers or hooks instead of hardcoded role checks.

## First Admin

During setup, create the first admin through a seed script or a protected manual database update. Do not expose public admin creation in the app.

Recommended flow:

1. Start the app locally.
2. Sign up through `/sign-up`.
3. Visit `/api/auth/me` while signed in so the Clerk user syncs into Neon.
4. Promote that first account:

```bash
npm run db:make-admin -- user@example.com
```

After promotion, that user can access `/admin/*`.
