model User {
  id        String   @id @default(uuid())
  clerkId   String   @unique
  email     String   @unique
  role      Role
  student   Student?
  teacher   Teacher?
  createdAt DateTime @default(now())
}

model Student {
  id           String   @id @default(uuid())
  userId       String   @unique
  user         User     @relation(fields: [userId], references: [id])

  fullName     String
  phone        String?
  parentPhone  String?
  address      String?

  batchId      String
  batch        Batch    @relation(fields: [batchId], references: [id])

  attendances  Attendance[]
  fees         Fee[]

  createdAt    DateTime @default(now())
}

model Teacher {
  id             String   @id @default(uuid())
  userId         String   @unique
  user           User     @relation(fields: [userId], references: [id])

  specialization String?

  batches        Batch[]

  createdAt      DateTime @default(now())
}

model Class {
  id          String   @id @default(uuid())
  name        String
  description String?

  batches     Batch[]

  createdAt   DateTime @default(now())
}

model Batch {
  id          String    @id @default(uuid())

  name        String

  classId     String
  class       Class     @relation(fields: [classId], references: [id])

  teacherId   String?
  teacher     Teacher?  @relation(fields: [teacherId], references: [id])

  students    Student[]
  assignments Assignment[]
  announcements Announcement[]
  attendances Attendance[]

  startTime   String?
  endTime     String?

  createdAt   DateTime @default(now())
}

model Attendance {
  id          String   @id @default(uuid())

  studentId   String
  student     Student  @relation(fields: [studentId], references: [id])

  batchId     String
  batch       Batch    @relation(fields: [batchId], references: [id])

  status      AttendanceStatus

  remarks     String?

  date        DateTime

  createdAt   DateTime @default(now())
}

model Assignment {
  id          String   @id @default(uuid())

  title       String
  description String?

  fileUrl     String?

  dueDate     DateTime?

  batchId      String
  batch        Batch    @relation(fields: [batchId], references: [id])

  createdBy    String

  createdAt    DateTime @default(now())
}

model Announcement {
  id          String   @id @default(uuid())

  title       String
  message     String

  batchId     String
  batch       Batch    @relation(fields: [batchId], references: [id])

  createdBy   String

  createdAt   DateTime @default(now())
}

model Fee {
  id          String   @id @default(uuid())

  studentId   String
  student     Student  @relation(fields: [studentId], references: [id])

  amount      Float

  dueDate     DateTime

  status      FeeStatus

  paidAt      DateTime?

  createdAt   DateTime @default(now())
}

enum Role {
  ADMIN
  TEACHER
  STUDENT
}

enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
}

enum FeeStatus {
  PAID
  PENDING
  OVERDUE
}