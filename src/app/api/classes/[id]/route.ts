import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { classIdSchema, classService, updateClassSchema } from "@/features/classes";
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

    const params = classIdSchema.parse(await context.params);
    const classRecord = await classService.getClass(params.id);

    return successResponse({ class: classRecord });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole([Role.ADMIN]);

    const params = classIdSchema.parse(await context.params);
    const input = updateClassSchema.parse(await request.json());
    const classRecord = await classService.updateClass(params.id, input);

    return successResponse({ class: classRecord });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole([Role.ADMIN]);

    const params = classIdSchema.parse(await context.params);
    const deleted = await classService.deleteClass(params.id);

    return successResponse({ deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
