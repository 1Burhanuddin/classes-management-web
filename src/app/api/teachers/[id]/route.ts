import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { teacherIdSchema, teacherService, updateTeacherSchema } from "@/features/teachers";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole([Role.ADMIN]);

    const params = teacherIdSchema.parse(await context.params);
    const teacher = await teacherService.getTeacher(params.id);

    return successResponse({ teacher });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole([Role.ADMIN]);

    const params = teacherIdSchema.parse(await context.params);
    const input = updateTeacherSchema.parse(await request.json());
    const teacher = await teacherService.updateTeacher(params.id, input);

    return successResponse({ teacher });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole([Role.ADMIN]);

    const params = teacherIdSchema.parse(await context.params);
    const deleted = await teacherService.deleteTeacher(params.id);

    return successResponse({ deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
