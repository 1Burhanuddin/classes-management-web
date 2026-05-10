import { NextRequest } from "next/server";
import { Role } from "@/generated/prisma/client";
import { announcementIdSchema, announcementService, updateAnnouncementSchema } from "@/features/announcements";
import { errorResponse, successResponse } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER, Role.STUDENT]);
    const params = announcementIdSchema.parse(await context.params);
    const announcement = await announcementService.getAnnouncement(user, params.id);

    return successResponse({ announcement });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER]);
    const params = announcementIdSchema.parse(await context.params);
    const input = updateAnnouncementSchema.parse(await request.json());
    const announcement = await announcementService.updateAnnouncement(user, params.id, input);

    return successResponse({ announcement });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const user = await requireRole([Role.ADMIN, Role.TEACHER]);
    const params = announcementIdSchema.parse(await context.params);
    const deleted = await announcementService.deleteAnnouncement(user, params.id);

    return successResponse({ deleted });
  } catch (error) {
    return errorResponse(error);
  }
}
