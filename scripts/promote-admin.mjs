import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";

config({ path: ".env.local" });

const email = process.argv[2] ?? process.env.ADMIN_EMAIL;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is required.");
  process.exit(1);
}

if (!email) {
  console.error("Usage: npm run db:make-admin -- user@example.com");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

const updated = await sql`
  update "User"
  set role = 'ADMIN', "updatedAt" = now()
  where email = ${email}
  returning id, email, role
`;

if (updated.length === 0) {
  console.error(`No user found for ${email}. Sign up first, then visit /api/auth/me.`);
  process.exit(1);
}

console.log(`Promoted ${updated[0].email} to ${updated[0].role}.`);
