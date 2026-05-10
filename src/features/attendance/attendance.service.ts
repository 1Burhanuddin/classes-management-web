import "server-only";

import { prisma } from "@/lib/prisma";
import { createAttendanceService } from "./attendance.service-core";

export { createAttendanceService } from "./attendance.service-core";

export const attendanceService = createAttendanceService(prisma);
