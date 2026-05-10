import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { batchService, createBatchSchema, listBatchesQuerySchema } from "@/features/batches";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireRole([Role.ADMIN]);

    const query = listBatchesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await batchService.listBatches(query);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole([Role.ADMIN]);

    const input = createBatchSchema.parse(await request.json());
    const batch = await batchService.createBatch(input);

    return successResponse({ batch }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
