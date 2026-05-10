import { config } from "dotenv";
import { spawnSync } from "node:child_process";

config({ path: ".env.local" });

const pooledUrl = process.env.DATABASE_URL;
const directUrl = process.env.DATABASE_DIRECT_URL ?? pooledUrl?.replace("-pooler.", ".");

if (!directUrl) {
  console.error("DATABASE_URL or DATABASE_DIRECT_URL is required.");
  process.exit(1);
}

const args = ["prisma", "migrate", "dev", ...process.argv.slice(2)];
const result = spawnSync("npx", args, {
  stdio: "inherit",
  env: {
    ...process.env,
    DATABASE_DIRECT_URL: directUrl,
  },
});

process.exit(result.status ?? 1);
