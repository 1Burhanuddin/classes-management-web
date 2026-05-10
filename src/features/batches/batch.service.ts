import "server-only";

import { prisma } from "@/lib/prisma";
import { createBatchService } from "./batch.service-core";

export { createBatchService } from "./batch.service-core";

export const batchService = createBatchService(prisma);
