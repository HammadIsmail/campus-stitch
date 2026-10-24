const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const readline = require("readline");
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
  console.error(
    "Error: DATABASE_URL is not set. Please provide it in your environment or in .env.local"
  );
  process.exit(1);
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

const PRESET_CAMPUSES = [
  {
    uniId: "uni_uet_lahore",
    uniName: "UET Lahore",
    campId: "camp_uet_main",
    campName: "Main Campus (Lahore)",
    city: "Lahore",
  },
  {
    uniId: "uni_uet_lahore",
    uniName: "UET Lahore",
    campId: "camp_uet_ksk",
    campName: "Kala Shah Kaku (KSK) Campus",
    city: "Kala Shah Kaku",
  },
  {
    uniId: "uni_fast_nuces",
    uniName: "FAST-NUCES",
    campId: "camp_fast_lhr",
    campName: "Lahore Campus",
    city: "Lahore",
  },
  {
    uniId: "uni_fast_nuces",
    uniName: "FAST-NUCES",
    campId: "camp_fast_isb",
    campName: "Islamabad Campus",
    city: "Islamabad",
  },
  {
    uniId: "uni_nust",
    uniName: "NUST",
    campId: "camp_nust_isb",
    campName: "Islamabad (H-12 Main)",
    city: "Islamabad",
  },
  {
    uniId: "uni_lums",
    uniName: "LUMS",
    campId: "camp_lums_main",
    campName: "Main Campus (DHA)",
    city: "Lahore",
  },
  {
    uniId: "uni_comsats",
    uniName: "COMSATS",
    campId: "camp_comsats_isb",
    campName: "Islamabad Campus",
    city: "Islamabad",
  },
  {
    uniId: "uni_comsats",
    uniName: "COMSATS",
    campId: "camp_comsats_lhr",
    campName: "Lahore Campus",
    city: "Lahore",
  },
];

function createPrompt() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return {
    ask(question, defaultValue = "") {
      return new Promise((resolve) => {
        const promptText = defaultValue
          ? `${question} [${defaultValue}]: `
          : `${question}: `;
        rl.question(promptText, (answer) => {
          resolve(answer.trim() || defaultValue);
        });
      });
    },
    close() {
      rl.close();
    },
  };
}

async function main() {
  console.log("\n==================================================");
  console.log(" CampuStitch - Interactive Admin Account Creator");
  console.log("==================================================");

  const prompt = createPrompt();

  try {
    // 1. Full Name
    let fullName = await prompt.ask("Enter Full Name", "Admin User");

    // 2. Email
    let email = "";
    while (!email || !email.includes("@")) {
      email = await prompt.ask("Enter Email Address (e.g. admin@campus.edu.pk)");
      if (!email.includes("@")) {
        console.log("  Please enter a valid email address with an '@' symbol.");
      }
    }
    email = email.toLowerCase().trim();

    // 3. Password
    let password = "";
    while (!password || password.length < 6) {
      password = await prompt.ask("Enter Password (min 6 characters)", "AdminPass123!");
      if (password.length < 6) {
        console.log("  Password must be at least 6 characters.");
      }
    }

    // 4. Role Selection
    console.log("\nSelect Role:");
    console.log("  [1] Super Admin  (Global multi-tenant root, in-app updates, universities)");
    console.log("  [2] Campus Admin (Moderator & student card verification for a campus)");
    console.log("  [3] Student      (Verified student account)");

    let roleChoice = await prompt.ask("Choose Role (1-3)", "1");
    let role = "super_admin";
    if (roleChoice === "2") {
      role = "campus_admin";
    } else if (roleChoice === "3") {
      role = "student";
    }

    // 5. Campus Assignment (for Campus Admin or Student)
    let selectedCampus = PRESET_CAMPUSES[0];
    if (role !== "super_admin") {
      console.log("\nSelect Assigned University & Campus:");
      PRESET_CAMPUSES.forEach((c, idx) => {
        console.log(`  [${idx + 1}] ${c.uniName} - ${c.campName} (${c.city})`);
      });
      console.log(`  [${PRESET_CAMPUSES.length + 1}] Custom / Enter Manually`);

      const campChoice = await prompt.ask(
        `Choose Campus (1-${PRESET_CAMPUSES.length + 1})`,
        "1"
      );
      const campIndex = parseInt(campChoice, 10) - 1;

      if (campIndex >= 0 && campIndex < PRESET_CAMPUSES.length) {
        selectedCampus = PRESET_CAMPUSES[campIndex];
      } else {
        const customUni = await prompt.ask("Enter University Name", "UET Lahore");
        const customCamp = await prompt.ask("Enter Campus Name", "Main Campus");
        const customCity = await prompt.ask("Enter City", "Lahore");
        selectedCampus = {
          uniId: "uni_" + customUni.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          uniName: customUni,
          campId: "camp_" + customCamp.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          campName: customCamp,
          city: customCity,
        };
      }
    }

    prompt.close();

    console.log("\nConnecting to database...");
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 10000,
    });
    await client.connect();

    // Ensure multi-tenant columns exist on profiles table
    await client.query(`
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'student';
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus_id text;
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS campus_name text;
      ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS university_id text;
    `);

    // Hash the password securely
    const passwordHash = hashPassword(password);

    console.log("Saving user account to database...");

    const universityVal = role === "super_admin" ? "CampuStitch Root" : selectedCampus.uniName;
    const campusNameVal = role === "super_admin" ? null : selectedCampus.campName;
    const campusIdVal = role === "super_admin" ? null : selectedCampus.campId;
    const universityIdVal = role === "super_admin" ? null : selectedCampus.uniId;
    const cityVal = role === "super_admin" ? "Islamabad" : selectedCampus.city;

    const query = `
      INSERT INTO public.profiles (
        id,
        email,
        password_hash,
        full_name,
        role,
        university,
        university_id,
        campus_id,
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
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11,
        true,
        'verified',
        '+923000000000',
        $12,
        5.0,
        1,
        NOW()
      )
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        university = EXCLUDED.university,
        university_id = EXCLUDED.university_id,
        campus_id = EXCLUDED.campus_id,
        campus_name = EXCLUDED.campus_name,
        city = EXCLUDED.city,
        is_verified = true,
        verification_status = 'verified';
    `;

    await client.query(query, [
      email,
      passwordHash,
      fullName,
      role,
      universityVal,
      universityIdVal,
      campusIdVal,
      campusNameVal,
      cityVal,
      role === "super_admin" ? "Platform Administration" : "Computer Science",
      role === "super_admin" ? "System Root" : "Faculty / Administration",
      role === "super_admin"
        ? "Platform Super Administrator with full global rights."
        : `Verified Campus Administrator for ${selectedCampus.campName}.`,
    ]);

    await client.end();

    // If campus admin, also register in local fallback cache tenants-cache.json
    if (role === "campus_admin") {
      try {
        const cacheFile = path.join(__dirname, "../tenants-cache.json");
        let cacheData = { universities: [], campusAdmins: [] };
        if (fs.existsSync(cacheFile)) {
          cacheData = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
        }
        if (!Array.isArray(cacheData.campusAdmins)) cacheData.campusAdmins = [];

        // Remove any previous record for this email
        cacheData.campusAdmins = cacheData.campusAdmins.filter(
          (a) => a.userEmail.toLowerCase() !== email.toLowerCase()
        );

        cacheData.campusAdmins.unshift({
          id: "ca_" + crypto.randomUUID().slice(0, 8),
          userId: "u_" + email.replace(/[^a-z0-9]/g, "_"),
          userEmail: email,
          userName: fullName,
          campusId: selectedCampus.campId,
          campusName: selectedCampus.campName,
          universityId: selectedCampus.uniId,
          universityName: selectedCampus.uniName,
          assignedBy: "CLI Admin Seeder",
          assignedAt: new Date().toISOString(),
        });

        fs.writeFileSync(cacheFile, JSON.stringify(cacheData, null, 2), "utf-8");
      } catch (_) {}
    }

    console.log("\n==================================================");
    console.log(" Account Created Successfully! 🎉");
    console.log("==================================================");
    console.log(`  Full Name:   ${fullName}`);
    console.log(`  Email:       ${email}`);
    console.log(`  Password:    ${password}`);
    console.log(`  Role:        ${role.toUpperCase()}`);
    console.log(`  Tenant:      ${role === "super_admin" ? "Global Multi-Tenant Root" : `${selectedCampus.uniName} - ${selectedCampus.campName}`}`);
    console.log(`  Status:      Verified Student / Trusted Staff`);
    console.log(`  Web Sign-In: http://localhost:3000/sign-in`);
    if (role === "super_admin") {
      console.log(`  Console:     http://localhost:3000/admin/super`);
    } else if (role === "campus_admin") {
      console.log(`  Console:     http://localhost:3000/admin`);
    }
    console.log("==================================================\n");
  } catch (err) {
    console.error("\nError creating account:", err.message);
    prompt.close();
  }
}

main();
