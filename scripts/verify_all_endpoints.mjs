import pg from "pg";
import fs from "fs";

const { Client } = pg;
const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
const dbUrl = match ? match[1].trim() : "";

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log("=== SUPABASE DATABASE TABLE VERIFICATION ===");

  const tables = [
    "profiles",
    "rides",
    "ride_bookings",
    "bikes",
    "bike_rentals",
    "listings",
    "shared_items",
    "shared_item_owners",
    "hostel_roommates",
    "hostel_services",
    "community_events",
    "verifications",
    "communities",
    "community_posts",
    "community_comments",
    "community_members",
    "post_votes",
    "profile_ratings",
    "notifications"
  ];

  for (const t of tables) {
    const res = await client.query(`SELECT count(*) FROM public."${t}";`);
    console.log(`✓ Table [${t}]: ${res.rows[0].count} records`);
  }

  await client.end();
}

main().catch(err => {
  console.error("Verification error:", err);
  process.exit(1);
});
