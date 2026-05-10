import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { studentIdSchema, studentService, updateStudentSchema } from "@/features/students";
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

    const params = studentIdSchema.parse(await context.params);
    const student = await studentService.getStudent(params.id);

    return successResponse({ student });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole([Role.ADMIN]);

    const params = studentIdSchema.parse(await context.params);
    const input = updateStudentSchema.parse(await request.json());
    const student = await studentService.updateStudent(params.id, input);

    return successResponse({ student });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole([Role.ADMIN]);

    const params = studentIdSchema.parse(await context.params);
    const deleted = await studentService.deleteStudent(params.id);

    return successResponse({ deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
