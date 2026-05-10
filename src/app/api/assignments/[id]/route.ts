import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { assignmentIdSchema, assignmentService, updateAssignmentSchema } from "@/features/assignments";
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
    const params = assignmentIdSchema.parse(await context.params);
    const assignment = await assignmentService.getAssignment(user, params.id);

    return successResponse({ assignment });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER]);
    const params = assignmentIdSchema.parse(await context.params);
    const input = updateAssignmentSchema.parse(await request.json());
    const assignment = await assignmentService.updateAssignment(user, params.id, input);

    return successResponse({ assignment });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER]);
    const params = assignmentIdSchema.parse(await context.params);
    const deleted = await assignmentService.deleteAssignment(user, params.id);

    return successResponse({ deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
