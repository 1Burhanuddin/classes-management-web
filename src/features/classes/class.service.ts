import "server-only";

import { prisma } from "@/lib/prisma";
import { createClassService } from "./class.service-core";

export { createClassService } from "./class.service-core";

export const classService = createClassService(prisma);
