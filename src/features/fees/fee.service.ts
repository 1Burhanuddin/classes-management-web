import "server-only";

import { prisma } from "@/lib/prisma";
import { createFeeService } from "./fee.service-core";

export { createFeeService } from "./fee.service-core";

export const feeService = createFeeService(prisma);
