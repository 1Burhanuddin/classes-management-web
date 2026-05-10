export { createTeacherService, teacherService } from "./teacher.service";
export type { PaginatedTeachers, TeacherListItem } from "./types/teacher.types";
export type { CreateTeacherInput, ListTeachersQuery, UpdateTeacherInput } from "./validation/teacher.schema";
export { createTeacherSchema, listTeachersQuerySchema, teacherIdSchema, updateTeacherSchema } from "./validation/teacher.schema";
