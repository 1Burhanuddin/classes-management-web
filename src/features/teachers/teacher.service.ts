import "server-only";

import { prisma } from "@/lib/prisma";
import { createTeacherService } from "./teacher.service-core";

export { createTeacherService } from "./teacher.service-core";

export const teacherService = createTeacherService(prisma);
