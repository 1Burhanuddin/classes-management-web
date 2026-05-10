import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { feeIdSchema, feeService, updateFeeSchema } from "@/features/fees";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole([Role.ADMIN, Role.STUDENT]);
    const params = feeIdSchema.parse(await context.params);
    const fee = await feeService.getFee(user, params.id);

    return successResponse({ fee });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole([Role.ADMIN]);
    const params = feeIdSchema.parse(await context.params);
    const input = updateFeeSchema.parse(await request.json());
    const fee = await feeService.updateFee(user, params.id, input);

    return successResponse({ fee });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole([Role.ADMIN]);
    const params = feeIdSchema.parse(await context.params);
    const deleted = await feeService.deleteFee(user, params.id);

    return successResponse({ deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
