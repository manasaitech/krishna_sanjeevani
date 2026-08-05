import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

/**
 * Initialize Drizzle ORM client using Cloudflare D1 binding.
 *
 * @param d1 Cloudflare D1 Database binding
 */
export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}
