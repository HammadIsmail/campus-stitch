const { Client } = require("pg");
const fs = require("fs");

const env = fs.readFileSync(".env.local", "utf8");
const match = env.match(/DATABASE_URL="?([^"\r\n]+)"?/);
const dbUrl = match ? match[1] : "";

if (!dbUrl) {
  console.error("No DATABASE_URL found in .env.local");
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function clearDb() {
  await client.connect();
  console.log("Connected to Supabase PostgreSQL database.");

  const tables = [
    "ride_bookings",
    "rides",
    "bike_rentals",
    "bikes",
    "listings",
    "shared_item_owners",
    "shared_items",
    "verifications",
    "hostel_roommates",
    "hostel_services",
    "community_events",
    "profiles",
  ];

  for (const t of tables) {
    try {
      await client.query(`TRUNCATE TABLE public.${t} CASCADE;`);
      console.log(`Successfully truncated table: public.${t}`);
    } catch (e) {
      console.log(`Notice on table public.${t}: ${e.message}`);
    }
  }

  await client.end();
  console.log("Database cleared successfully.");
}

clearDb().catch((err) => {
  console.error("Database clear error:", err);
  process.exit(1);
});
