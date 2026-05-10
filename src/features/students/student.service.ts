import "server-only";

import { prisma } from "@/lib/prisma";
import { createStudentService } from "./student.service-core";

export { createStudentService } from "./student.service-core";

export const studentService = createStudentService(prisma);
