import "server-only";

import type { User } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type SyncClerkUserInput = {
  clerkId: string;
  email: string;
};

export async function syncClerkUser(input: SyncClerkUserInput): Promise<User> {
  return prisma.user.upsert({
    where: {
      clerkId: input.clerkId,
    },
    update: {
      email: input.email,
    },
    create: {
      clerkId: input.clerkId,
      email: input.email,
    },
  });
}

export async function getUserByClerkId(clerkId: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: {
      clerkId,
    },
  });
}
