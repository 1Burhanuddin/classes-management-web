import { ZodError } from "zod";
import { NextResponse } from "next/server";
import { isApiError } from "@/lib/api-errors";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function errorResponse(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        message: "Validation failed",
        errors: error.flatten(),
      },
      { status: 400 },
    );
  }

  if (isApiError(error)) {
    return NextResponse.json({ message: error.message }, { status: error.status });
  }

  return NextResponse.json({ message: "Internal server error" }, { status: 500 });
}
