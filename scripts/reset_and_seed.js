const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

const DATABASE_URL =
  process.env.DATABASE_URL ||
  "postgresql://postgres.ccxtfbytfrffewpuscak:voFMFcWkHwR0yLzW@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres";

async function run() {
  console.log("==================================================");
  console.log(" CampuStitch - Database Reset & Admin Seeder");
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

    // 1. Clear operational data tables
    console.log("\n1. Clearing operational data tables...");
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

    // 1b. Ensure multi-tenant columns exist on profiles table
    console.log("\n1b. Ensuring multi-tenant columns (role, campus_id, campus_name) exist...");
    await client.query(`
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student';
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus_id text;
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus_name text;
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS university_id text;
    `);
    console.log("   - Columns verified!");

    // 2. Hash passwords
    console.log("\n2. Hashing admin credentials with PBKDF2-SHA512...");
    const superAdminPassword = hashPassword("AdminPass123!");
    const campusAdminPassword = hashPassword("AdminPass123!");
    const studentPassword = hashPassword("StudentPass123!");

    // 3. Seed Super Admin
    console.log("\n3. Inserting Super Admin account...");
    const superAdminQuery = `
      INSERT INTO public.profiles (
        id,
        email,
        password_hash,
        full_name,
        role,
        university,
        is_verified,
        verification_status,
        phone,
        bio,
        rating_avg,
        rating_count,
        created_at
      ) VALUES (
        gen_random_uuid(),
        'ranahammadismail@gmail.com',
        $1,
        'Rana Hammad Ismail',
        'super_admin',
        'CampuStitch Root',
        true,
        'verified',
        '+923000000000',
        'Platform Super Administrator with global multi-tenant access.',
        5.0,
        1,
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = 'super_admin',
        is_verified = true,
        verification_status = 'verified';
    `;
    await client.query(superAdminQuery, [superAdminPassword]);
    console.log("   Super Admin created: ranahammadismail@gmail.com (Password: AdminPass123!)");

    // 4. Seed Campus Admin for UET Lahore
    console.log("\n4. Inserting UET Campus Admin account...");
    const campusAdminQuery = `
      INSERT INTO public.profiles (
        id,
        email,
        password_hash,
        full_name,
        role,
        university,
        campus_name,
        city,
        department,
        program,
        is_verified,
        verification_status,
        phone,
        bio,
        rating_avg,
        rating_count,
        created_at
      ) VALUES (
        gen_random_uuid(),
        'admin@uet.edu.pk',
        $1,
        'Engr. Usman Qureshi',
        'campus_admin',
        'UET Lahore',
        'Main Campus (Lahore)',
        'Lahore',
        'Computer Science',
        'Faculty / Campus Administration',
        true,
        'verified',
        '+923120000000',
        'UET Lahore Main Campus Administrator & Student Verification Moderator.',
        5.0,
        1,
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = 'campus_admin',
        is_verified = true,
        verification_status = 'verified';
    `;
    await client.query(campusAdminQuery, [campusAdminPassword]);
    console.log("   Campus Admin created: admin@uet.edu.pk (Password: AdminPass123!)");

    // 5. Seed Test Student Account
    console.log("\n5. Inserting Verified Demo Student account...");
    const studentQuery = `
      INSERT INTO public.profiles (
        id,
        email,
        password_hash,
        full_name,
        role,
        university,
        campus_name,
        city,
        department,
        program,
        is_verified,
        verification_status,
        phone,
        bio,
        rating_avg,
        rating_count,
        created_at
      ) VALUES (
        gen_random_uuid(),
        'student@uet.edu.pk',
        $1,
        'Ali Ahmed Khan',
        'student',
        'UET Lahore',
        'Main Campus (Lahore)',
        'Lahore',
        'Computer Science',
        'BS Computer Science',
        true,
        'verified',
        '+923210000000',
        'Senior student at UET Lahore Main Campus.',
        5.0,
        5,
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        role = 'student',
        is_verified = true,
        verification_status = 'verified';
    `;
    await client.query(studentQuery, [studentPassword]);
    console.log("   Student created: student@uet.edu.pk (Password: StudentPass123!)");

    console.log("\n Database successfully reset and seeded with clean admins!");
  } catch (err) {
    console.error("Database reset error:", err.message);
  } finally {
    await client.end();
  }

  // 6. Also update local offline fallback cache (tenants-cache.json)
  try {
    const cacheFile = path.join(__dirname, "../tenants-cache.json");
    if (fs.existsSync(cacheFile)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
      cacheData.campusAdmins = [
        {
          id: "ca_uet_main_admin",
          userId: "u_admin_uet_edu_pk",
          userEmail: "admin@uet.edu.pk",
          userName: "Engr. Usman Qureshi",
          campusId: "camp_uet_main",
          campusName: "Main Campus (Lahore)",
          universityId: "uni_uet_lahore",
          universityName: "UET Lahore",
          assignedBy: "ranahammadismail@gmail.com",
          assignedAt: new Date().toISOString(),
        },
      ];
      fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2), "utf-8");
      console.log("   Updated local offline fallback tenants-cache.json with Campus Admin assignment.");
    }
  } catch (cacheErr) {
    console.warn("Could not sync tenants-cache.json:", cacheErr.message);
  }
}

run();
