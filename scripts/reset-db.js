const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

// Load DATABASE_URL from environment or .env.local
let DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  try {
    const envPath = path.join(__dirname, "../.env.local");
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, "utf-8");
      const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
      if (match) DATABASE_URL = match[1];
    }
  } catch (_) {}
}

if (!DATABASE_URL) {
  DATABASE_URL =
    "postgresql://postgres.ccxtfbytfrffewpuscak:voFMFcWkHwR0yLzW@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";
}

async function resetDatabase() {
  console.log("\n==================================================");
  console.log(" CampuStitch - Database Reset (Wipe All Data)");
  console.log("==================================================");

  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 10000,
  });

  try {
    console.log("\nConnecting to PostgreSQL database...");
    await client.connect();
    console.log("Connected successfully!");

    console.log("\nClearing operational data tables...");
    const tablesToWipe = [
      "verifications",
      "ride_bookings",
      "rides",
      "listings",
      "bike_rentals",
      "bikes",
      "shared_item_owners",
      "shared_items",
      "hostel_roommates",
      "hostel_services",
      "community_events",
      "user_push_tokens",
      "profiles",
    ];

    for (const table of tablesToWipe) {
      try {
        await client.query(`TRUNCATE TABLE public.${table} CASCADE;`);
        console.log(`   - Cleared public.${table}`);
      } catch (err) {
        try {
          await client.query(`DELETE FROM public.${table};`);
          console.log(`   - Deleted rows from public.${table}`);
        } catch (delErr) {
          console.warn(`   Notice: Could not clear ${table} (${delErr.message})`);
        }
      }
    }

    // Ensure multi-tenant columns exist on profiles
    console.log("\nVerifying multi-tenant RBAC columns...");
    await client.query(`
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student';
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus_id text;
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus_name text;
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS university_id text;
    `);
    console.log("   - Columns verified!");

    console.log("\n Database successfully wiped clean!");
    console.log("   All operational data and users removed.");
    console.log("   (Universities and Campuses are preserved intact).");
    console.log("\nNext Step:");
    console.log("   Run 'node scripts/create-admin.js' to create an admin account.\n");
  } catch (err) {
    console.error("Database reset error:", err.message);
  } finally {
    await client.end();
  }

  // Clear local fallback cache campusAdmins
  try {
    const cacheFile = path.join(__dirname, "../tenants-cache.json");
    if (fs.existsSync(cacheFile)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
      cacheData.campusAdmins = [];
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2), "utf-8");
      console.log("Local offline tenants-cache.json admin assignments cleared.\n");
    }
  } catch (_) {}
}

resetDatabase();
