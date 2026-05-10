import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { assignmentService, createAssignmentSchema, listAssignmentsQuerySchema } from "@/features/assignments";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER, Role.STUDENT]);
    const query = listAssignmentsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await assignmentService.listAssignments(user, query);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER]);
    const input = createAssignmentSchema.parse(await request.json());
    const assignment = await assignmentService.createAssignment(user, input);

    return successResponse({ assignment }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
