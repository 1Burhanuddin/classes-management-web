import { NextResponse } from "next/server";
import { getDatabaseTime } from "@/app/actions";

export async function GET() {
  try {
    const result = await getDatabaseTime();

    return NextResponse.json({
      ok: true,
      now: result.now,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Database connection failed",
      },
      { status: 500 },
    );
  }
}
