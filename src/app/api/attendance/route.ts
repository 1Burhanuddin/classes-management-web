import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { attendanceService, createAttendanceSchema, listAttendanceQuerySchema } from "@/features/attendance";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER, Role.STUDENT]);
    const query = listAttendanceQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await attendanceService.listAttendance(user, query);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER]);
    const input = createAttendanceSchema.parse(await request.json());
    const attendance = await attendanceService.createAttendance(user, input);

    return successResponse({ attendance }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
