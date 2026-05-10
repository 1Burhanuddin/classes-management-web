import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { createStudentSchema, listStudentsQuerySchema, studentService } from "@/features/students";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    await requireRole([Role.ADMIN]);

    const query = listStudentsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await studentService.listStudents(query);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireRole([Role.ADMIN]);

    const input = createStudentSchema.parse(await request.json());
    const student = await studentService.createStudent(input);

    return successResponse({ student }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
