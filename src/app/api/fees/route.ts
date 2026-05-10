import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { createFeeSchema, feeService, listFeesQuerySchema } from "@/features/fees";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole([Role.ADMIN, Role.STUDENT]);
    const query = listFeesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await feeService.listFees(user, query);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole([Role.ADMIN]);
    const input = createFeeSchema.parse(await request.json());
    const fee = await feeService.createFee(user, input);

    return successResponse({ fee }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
