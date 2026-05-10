import "server-only";

import { prisma } from "@/lib/prisma";
import { createAssignmentService } from "./assignment.service-core";

export { createAssignmentService } from "./assignment.service-core";

export const assignmentService = createAssignmentService(prisma);
