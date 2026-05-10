import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { announcementService, createAnnouncementSchema, listAnnouncementsQuerySchema } from "@/features/announcements";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER, Role.STUDENT]);
    const query = listAnnouncementsQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const result = await announcementService.listAnnouncements(user, query);

    return successResponse(result);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER]);
    const input = createAnnouncementSchema.parse(await request.json());
    const announcement = await announcementService.createAnnouncement(user, input);

    return successResponse({ announcement }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}
