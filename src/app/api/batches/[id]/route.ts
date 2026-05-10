import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { batchIdSchema, batchService, updateBatchSchema } from "@/features/batches";
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

    const params = batchIdSchema.parse(await context.params);
    const batch = await batchService.getBatch(params.id);

    return successResponse({ batch });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    await requireRole([Role.ADMIN]);

    const params = batchIdSchema.parse(await context.params);
    const input = updateBatchSchema.parse(await request.json());
    const batch = await batchService.updateBatch(params.id, input);

    return successResponse({ batch });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    await requireRole([Role.ADMIN]);

    const params = batchIdSchema.parse(await context.params);
    const deleted = await batchService.deleteBatch(params.id);

    return successResponse({ deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
