import fs from "fs";
import pg from "pg";

const env = fs.existsSync(".env.local") ? fs.readFileSync(".env.local", "utf8") : "";
const dbMatch = env.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const dbUrl = process.env.DATABASE_URL || (dbMatch ? dbMatch[1].trim() : "");

const client = new pg.Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

try {
  await client.connect();
  console.log("Connected to Supabase Postgres.");
  await client.query("ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;");
  console.log("Added bio column if not existed!");
  const res = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';"
  );
  console.log("Columns:", res.rows.map((r) => r.column_name).join(", "));
} catch (err) {
  console.error("Migration error:", err);
} finally {
  await client.end();
}
