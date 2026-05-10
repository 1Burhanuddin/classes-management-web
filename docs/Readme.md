# Classes Management System - Architecture And Development Guide

## Goal

Build a scalable MVP/prototype within 1 week for:

- Admin
- Teacher
- Student

This is not an ERP. The goal is a usable MVP with a scalable architecture, modular codebase, and AI IDE friendly structure.

## Tech Stack

### Frontend

- Next.js
- TypeScript
- Tailwind CSS
- shadcn/ui
- Redux Toolkit
- RTK Query
- React Hook Form
- Zod

### Backend

- Next.js Route Handlers
- Prisma ORM
- PostgreSQL

### Authentication

- Clerk

### Storage

- Cloudinary
- Supabase Storage

### Deployment

- Vercel
- Neon PostgreSQL or Supabase

## Architecture

```txt
Frontend pages and components
  -> React Hook Form and Zod
  -> RTK Query
  -> Next.js API route handlers
  -> Feature service layer
  -> Prisma ORM
  -> PostgreSQL
```

## Docs Index

- [Folder structure](./folder-structure.md)
- [API structure](./api/api-structure.md)
- [Routes](./route.md)
- [Authentication](./auth.md)
- [Middleware and permissions](./rules/middleware-rules.md)
- [Features and rules](./features.md)
- [Database schema](./Database-Schema.md)
- [Development plan](./development-plan.md)
- [Frappe LMS reference](./reference/frappe-lms.md)
- [Project progress](./progress.md)

## Main Rules

1. Use UUID everywhere.
2. Keep APIs modular.
3. Never hardcode role logic in components.
4. Use the service layer.
5. Use reusable tables and forms.
6. Keep feature-based architecture.
7. Store files externally.
