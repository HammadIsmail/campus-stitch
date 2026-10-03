import fs from "fs";
import path from "path";
import pg from "pg";

const { Client } = pg;

async function run() {
  console.log("Reading .env.local and supabase/schema.sql...");

  const envContent = fs.readFileSync(".env.local", "utf8");
  const dbMatch = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);

  if (!dbMatch || !dbMatch[1]) {
    console.error("Error: DATABASE_URL not found in .env.local");
    process.exit(1);
  }

  const directUrl = dbMatch[1].trim();
  const schemaSql = fs.readFileSync("supabase/schema.sql", "utf8");

  // Also construct pooler fallback URL just in case ISP doesn't support IPv6
  const poolerUrl = directUrl.replace(
    "postgres:voFMFcWkHwR0yLzW@db.ccxtfbytfrffewpuscak.supabase.co:5432/postgres",
    "postgres.ccxtfbytfrffewpuscak:voFMFcWkHwR0yLzW@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres",
  );

  let client;
  let connected = false;

  console.log("Connecting to Supabase Postgres (Direct Connection)...");
  try {
    client = new Client({
      connectionString: directUrl,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    await client.connect();
    connected = true;
    console.log("Connected successfully via Direct Connection!");
  } catch (err) {
    console.warn(
      "Direct connection failed (" +
        err.message +
        "). Trying Transaction Pooler...",
    );
    try {
      client = new Client({
        connectionString: poolerUrl,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 15000,
      });
      await client.connect();
      connected = true;
      console.log("Connected successfully via Pooler Connection!");
    } catch (poolerErr) {
      console.error("Failed to connect via pooler as well:", poolerErr.message);
      process.exit(1);
    }
  }

  try {
    console.log("Executing supabase/schema.sql on remote Supabase database...");
    await client.query(schemaSql);
    console.log(
      "SUCCESS! All tables, policies, and seed data created successfully!",
    );

    // Verify created tables
    console.log("\nVerifying created tables in public schema:");
    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

    console.log(
      "Tables in database:",
      res.rows.map((r) => r.table_name).join(", "),
    );

    // Verify rides count
    const ridesRes = await client.query("SELECT COUNT(*) FROM public.rides;");
    console.log(`Active rides seeded: ${ridesRes.rows[0].count}`);

    // Verify listings count
    const listingsRes = await client.query(
      "SELECT COUNT(*) FROM public.listings;",
    );
    console.log(`Market listings seeded: ${listingsRes.rows[0].count}`);
  } catch (sqlErr) {
    console.error("Error executing schema:", sqlErr);
  } finally {
    await client.end();
  }
}

run();
