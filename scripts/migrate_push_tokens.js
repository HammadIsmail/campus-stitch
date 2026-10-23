const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres.ccxtfbytfrffewpuscak:voFMFcWkHwR0yLzW@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to Supabase PostgreSQL.");

    const query = `
      create table if not exists user_push_tokens (
        id uuid primary key default gen_random_uuid(),
        user_id text not null,
        token text not null unique,
        platform text check (platform in ('web', 'android', 'ios')),
        created_at timestamptz default now(),
        updated_at timestamptz default now()
      );

      create index if not exists idx_user_push_tokens_user_id on user_push_tokens(user_id);
    `;

    await client.query(query);
    console.log("SUCCESS: Table user_push_tokens and index created successfully!");
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    await client.end();
  }
}

run();
