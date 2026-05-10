import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { attendanceIdSchema, attendanceService, updateAttendanceSchema } from "@/features/attendance";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER, Role.STUDENT]);
    const params = attendanceIdSchema.parse(await context.params);
    const attendance = await attendanceService.getAttendance(user, params.id);

    return successResponse({ attendance });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER]);
    const params = attendanceIdSchema.parse(await context.params);
    const input = updateAttendanceSchema.parse(await request.json());
    const attendance = await attendanceService.updateAttendance(user, params.id, input);

    return successResponse({ attendance });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER]);
    const params = attendanceIdSchema.parse(await context.params);
    const deleted = await attendanceService.deleteAttendance(user, params.id);

    return successResponse({ deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
