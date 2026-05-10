import "server-only";

import { prisma } from "@/lib/prisma";
import { createAnnouncementService } from "./announcement.service-core";

export { createAnnouncementService } from "./announcement.service-core";

export const announcementService = createAnnouncementService(prisma);
