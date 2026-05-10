import { NextResponse } from "next/server";
import { getCurrentDbUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentDbUser();

  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
    },
  });
}
