import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { classService, createClassSchema, listClassesQuerySchema } from "@/features/classes";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireRole([Role.ADMIN]);

    const query = listClassesQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await classService.listClasses(query);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole([Role.ADMIN]);

    const input = createClassSchema.parse(await request.json());
    const classRecord = await classService.createClass(input);

    return successResponse({ class: classRecord }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
