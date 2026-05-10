import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { createTeacherSchema, listTeachersQuerySchema, teacherService } from "@/features/teachers";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireRole([Role.ADMIN]);

    const query = listTeachersQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await teacherService.listTeachers(query);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole([Role.ADMIN]);

    const input = createTeacherSchema.parse(await request.json());
    const teacher = await teacherService.createTeacher(input);

    return successResponse({ teacher }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
