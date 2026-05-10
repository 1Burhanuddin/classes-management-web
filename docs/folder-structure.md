# Folder Structure

Use feature-based architecture. Shared building blocks live in `components`, app-level routing lives in `app`, API state lives in `store`, and business logic lives beside each feature.

```txt
src/
├── app/
│   ├── api/
│   ├── admin/
│   ├── teacher/
│   └── student/
│
├── components/
│   ├── ui/
│   ├── shared/
│   └── layouts/
│
├── features/
│   ├── students/
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── validation/
│   │   ├── student.service.ts
│   │   └── index.ts
│   │
│   ├── classes/
│   ├── teachers/
│   ├── batches/
│   ├── attendance/
│   ├── assignments/
│   ├── announcements/
│   ├── fees/
│   └── dashboard/
│
├── store/
│   ├── store.ts
│   ├── provider.tsx
│   └── api/
│       ├── baseApi.ts
│       ├── classApi.ts
│       ├── studentApi.ts
│       ├── teacherApi.ts
│       ├── batchApi.ts
│       └── attendanceApi.ts
│
├── lib/
│   ├── prisma.ts
│   ├── clerk.ts
│   ├── roles.ts
│   └── storage.ts
│
├── hooks/
├── types/
├── validation/
└── utils/
```

## Placement Rules

- Put feature-specific UI in `src/features/<feature>/components`.
- Put feature-specific hooks in `src/features/<feature>/hooks`.
- Put feature-specific TypeScript types in `src/features/<feature>/types`.
- Put feature-specific Zod schemas in `src/features/<feature>/validation`.
- Put feature business logic in `src/features/<feature>/<feature>.service.ts`.
- Put RTK Query endpoints in `src/store/api/*Api.ts`.
- Put cross-feature helpers in `src/lib`, `src/hooks`, `src/types`, or `src/validation`.
- Put reusable UI primitives and shared app components in `src/components`.

## Reusable Components

Build once and reuse everywhere:

- `DataTable`
- `FormModal`
- `ConfirmDialog`
- `SearchInput`
- `Pagination`
- `StatusBadge`
- `EmptyState`
- `DashboardCard`
- `PageHeader`

These belong in `src/components/shared` unless they are low-level shadcn wrappers, which belong in `src/components/ui`.
