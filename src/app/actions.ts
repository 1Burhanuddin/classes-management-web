"use server";

import { sql } from "@/lib/neon";

export async function getDatabaseTime() {
  const [result] = await sql`select now()`;

  return result as { now: Date };
}
