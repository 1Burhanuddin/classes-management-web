import "server-only";

import { auth, clerkClient } from "@clerk/nextjs/server";
import type { Role, User } from "@/generated/prisma/client";
import { syncClerkUser } from "@/features/users";
import { ApiError } from "@/lib/api-errors";
import { canAccessRole } from "@/lib/roles";

export async function getCurrentDbUser(): Promise<User | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const client = await clerkClient();
  const clerkUser = await client.users.getUser(userId);
  const email = clerkUser?.primaryEmailAddress?.emailAddress;

  if (!email) {
    return null;
  }

  return syncClerkUser({
    clerkId: userId,
    email,
  });
}

export async function requireDbUser(): Promise<User> {
  const user = await getCurrentDbUser();

  if (!user) {
    throw new ApiError(401, "Unauthorized");
  }

  return user;
}

export async function requireRole(allowedRoles: Role[]): Promise<User> {
  const user = await requireDbUser();

  if (!canAccessRole(user.role, allowedRoles)) {
    throw new ApiError(403, "Forbidden");
  }

  return user;
}
