# App Routes

Use route groups by role. Middleware protects each group, while API routes still perform their own authorization checks.

```txt
/admin/*
/teacher/*
/student/*
```

## Admin Pages

```txt
/admin/dashboard
/admin/students
/admin/teachers
/admin/classes
/admin/batches
/admin/attendance
/admin/assignments
/admin/announcements
/admin/fees
```

## Teacher Pages

```txt
/teacher/dashboard
/teacher/batches
/teacher/attendance
/teacher/assignments
/teacher/announcements
```

## Student Pages

```txt
/student/dashboard
/student/attendance
/student/assignments
/student/announcements
/student/fees
/student/schedule
```
