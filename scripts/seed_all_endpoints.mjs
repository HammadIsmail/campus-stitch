import pg from "pg";
import fs from "fs";
import crypto from "crypto";

const { Client } = pg;

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

const envContent = fs.readFileSync(".env.local", "utf8");
const dbMatch = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
if (!dbMatch || !dbMatch[1]) {
  console.error("DATABASE_URL not found in .env.local");
  process.exit(1);
}
const dbUrl = dbMatch[1].trim();

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false },
});

async function seed() {
  await client.connect();
  console.log("Connected to Supabase PostgreSQL Database.");

  // 1. Ensure notifications table exists
  console.log("Creating/Ensuring notifications table...");
  await client.query(`
    create table if not exists public.notifications (
      id uuid primary key default uuid_generate_v4(),
      user_id text,
      type text check (type in ('ride', 'market', 'bike', 'verification', 'community')) default 'ride',
      title text not null,
      message text not null,
      time text default 'Just now',
      deeplink text default '/',
      is_read boolean default false,
      created_at timestamp with time zone default timezone('utc'::text, now()) not null
    );
    alter table public.notifications enable row level security;
    drop policy if exists "Allow public read notifications" on public.notifications;
    create policy "Allow public read notifications" on public.notifications for select using (true);
    drop policy if exists "Allow public insert notifications" on public.notifications;
    create policy "Allow public insert notifications" on public.notifications for insert with check (true);
    drop policy if exists "Allow public update notifications" on public.notifications;
    create policy "Allow public update notifications" on public.notifications for update using (true);
  `);

  // Ensure permissive RLS policies on all tables so UI/API works seamlessly
  console.log("Ensuring permissive RLS policies on all tables...");
  const tablesWithRLS = [
    'communities',
    'community_posts',
    'community_comments',
    'community_members',
    'post_votes',
    'profile_ratings',
    'hostel_services',
    'hostel_roommates',
    'community_events'
  ];

  for (const tbl of tablesWithRLS) {
    try {
      await client.query(`alter table public.${tbl} enable row level security;`);
      await client.query(`drop policy if exists "Allow public all ${tbl}" on public.${tbl};`);
      await client.query(`create policy "Allow public all ${tbl}" on public.${tbl} for all using (true) with check (true);`);
    } catch (e) {
      console.warn(`Policy notice on ${tbl}:`, e.message);
    }
  }

  const defaultPasswordHash = hashPassword("Password123!");

  // 2. PROFILES
  console.log("\n--- Seeding Profiles ---");
  const profiles = [
    {
      id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      email: "itxmalphashere@gmail.com",
      full_name: "Muhammad Hammad Ismail",
      student_id: "2023-CS-807",
      university: "UET Lahore",
      program: "BS Computer Science",
      department: "Department of Computer Science",
      is_verified: true,
      verification_status: "verified",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80",
      phone: "+92 300 1234567",
      cnic: "35201-1234567-1",
      rating_avg: 5.0,
      rating_count: 3,
      password_hash: defaultPasswordHash,
    },
    {
      id: "7547d4b2-0e67-46d3-8421-8a9e4fcbc108",
      email: "areebaasif9832@gmail.com",
      full_name: "Areeba Asif",
      student_id: "2023-CS-805",
      university: "UET Lahore",
      program: "BS Computer Science",
      department: "Department of Computer Science",
      is_verified: true,
      verification_status: "verified",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
      phone: "+92 321 9876543",
      cnic: "35201-7654321-2",
      rating_avg: 5.0,
      rating_count: 2,
      password_hash: defaultPasswordHash,
    },
    {
      id: "e4a2d590-7119-4821-b384-9388bf3a9482",
      email: "ranahammadismail@gmail.com",
      full_name: "Rana Hammad Ismail (Admin Moderator)",
      student_id: "UET-ADMIN-01",
      university: "UET Lahore",
      program: "Platform Administrator",
      department: "Administration & Moderation",
      is_verified: true,
      verification_status: "verified",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80",
      phone: "+92 300 0000000",
      cnic: "35201-0000000-0",
      rating_avg: 5.0,
      rating_count: 15,
      password_hash: defaultPasswordHash,
    },
    {
      id: "c9f12345-6789-4abc-def0-123456789001",
      email: "sara.khan@uet.edu.pk",
      full_name: "Sara Khan",
      student_id: "2022-CS-045",
      university: "UET Lahore",
      program: "BS Computer Science",
      department: "Department of Computer Science",
      is_verified: true,
      verification_status: "verified",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
      phone: "+92 312 3456789",
      cnic: "35202-3456789-2",
      rating_avg: 5.0,
      rating_count: 4,
      password_hash: defaultPasswordHash,
    },
    {
      id: "c9f12345-6789-4abc-def0-123456789002",
      email: "ahmed.raza@uet.edu.pk",
      full_name: "Ahmed Raza",
      student_id: "2021-EE-104",
      university: "UET Lahore",
      program: "BS Electrical Engineering",
      department: "Department of Electrical Engineering",
      is_verified: true,
      verification_status: "verified",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      phone: "+92 333 4567890",
      cnic: "35201-4567890-1",
      rating_avg: 4.9,
      rating_count: 8,
      password_hash: defaultPasswordHash,
    },
    {
      id: "c9f12345-6789-4abc-def0-123456789003",
      email: "usman.tariq@uet.edu.pk",
      full_name: "Usman Tariq",
      student_id: "2022-ME-089",
      university: "UET Lahore",
      program: "BS Mechanical Engineering",
      department: "Department of Mechanical Engineering",
      is_verified: true,
      verification_status: "verified",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80",
      phone: "+92 345 5678901",
      cnic: "35202-5678901-1",
      rating_avg: 5.0,
      rating_count: 5,
      password_hash: defaultPasswordHash,
    },
    {
      id: "c9f12345-6789-4abc-def0-123456789004",
      email: "bilal.cheema@uet.edu.pk",
      full_name: "Bilal Cheema",
      student_id: "2023-CE-140",
      university: "UET Lahore",
      program: "BS Civil Engineering",
      department: "Department of Civil Engineering",
      is_verified: true,
      verification_status: "verified",
      avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80",
      phone: "+92 301 6789012",
      cnic: "35201-6789012-1",
      rating_avg: 4.8,
      rating_count: 3,
      password_hash: defaultPasswordHash,
    },
    {
      id: "c9f12345-6789-4abc-def0-123456789005",
      email: "ayesha.noor@uet.edu.pk",
      full_name: "Ayesha Noor",
      student_id: "2024-CS-301",
      university: "UET Lahore",
      program: "BS Computer Science",
      department: "Department of Computer Science",
      is_verified: true,
      verification_status: "verified",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      phone: "+92 322 7890123",
      cnic: "35202-7890123-2",
      rating_avg: 5.0,
      rating_count: 2,
      password_hash: defaultPasswordHash,
    },
    {
      id: "c9f12345-6789-4abc-def0-123456789006",
      email: "zainab.malik@uet.edu.pk",
      full_name: "Zainab Malik",
      student_id: "2021-EE-012",
      university: "UET Lahore",
      program: "BS Electrical Engineering",
      department: "Department of Electrical Engineering",
      is_verified: true,
      verification_status: "verified",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80",
      phone: "+92 315 8901234",
      cnic: "35201-8901234-2",
      rating_avg: 5.0,
      rating_count: 6,
      password_hash: defaultPasswordHash,
    },
    {
      id: "c9f12345-6789-4abc-def0-123456789007",
      email: "hamza.sheikh@uet.edu.pk",
      full_name: "Hamza Sheikh",
      student_id: "2022-ARCH-033",
      university: "UET Lahore",
      program: "B. Architecture",
      department: "Department of Architecture",
      is_verified: true,
      verification_status: "verified",
      avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
      phone: "+92 334 9012345",
      cnic: "35202-9012345-1",
      rating_avg: 4.9,
      rating_count: 7,
      password_hash: defaultPasswordHash,
    }
  ];

  for (const p of profiles) {
    await client.query(`
      insert into public.profiles (
        id, email, full_name, student_id, university, program, department, 
        is_verified, verification_status, avatar_url, phone, cnic, rating_avg, rating_count, password_hash
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      on conflict (id) do update set
        full_name = excluded.full_name,
        email = excluded.email,
        student_id = excluded.student_id,
        program = excluded.program,
        department = excluded.department,
        is_verified = excluded.is_verified,
        verification_status = excluded.verification_status,
        rating_avg = excluded.rating_avg,
        rating_count = excluded.rating_count,
        password_hash = excluded.password_hash;
    `, [
      p.id, p.email, p.full_name, p.student_id, p.university, p.program, p.department,
      p.is_verified, p.verification_status, p.avatar_url, p.phone, p.cnic, p.rating_avg, p.rating_count, p.password_hash
    ]);
  }
  console.log(`Seeded/Updated ${profiles.length} student profiles.`);

  // 3. RIDES & RIDE BOOKINGS
  console.log("\n--- Seeding Rides & Ride Bookings ---");
  await client.query("delete from public.ride_bookings;");
  await client.query("delete from public.rides;");

  const ridesData = [
    {
      id: crypto.randomUUID(),
      organizer_id: "c9f12345-6789-4abc-def0-123456789002",
      organizer_name: "Ahmed Raza",
      organizer_verified: true,
      from_location: "Khurrialwala Main Chowk",
      to_location: "UET Main Campus Gate 3",
      departure_date: new Date().toISOString().split("T")[0],
      departure_time: "8:00 AM",
      vehicle_type: "rickshaw",
      total_cost: 200,
      price_per_seat: 50,
      total_seats: 4,
      available_seats: 1,
      pickup_point: "Main Chowk Rickshaw Stand",
      notes: "Permanent morning rickshaw split: Rs. 200 ÷ 4 students. Drops directly at CS department.",
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      organizer_id: "c9f12345-6789-4abc-def0-123456789001",
      organizer_name: "Sara Khan",
      organizer_verified: true,
      from_location: "Near Khurrialwala (Gulshan Gate)",
      to_location: "University CS Seminar Hall",
      departure_date: new Date().toISOString().split("T")[0],
      departure_time: "8:15 AM",
      vehicle_type: "car",
      total_cost: 280,
      price_per_seat: 70,
      total_seats: 4,
      available_seats: 2,
      pickup_point: "Gulshan Block Main Gate",
      notes: "Honda City with AC on, polite driving. Female students welcome for carpool.",
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      organizer_id: "c9f12345-6789-4abc-def0-123456789003",
      organizer_name: "Usman Tariq",
      organizer_verified: true,
      from_location: "Khurrialwala (Civil Lines Stop)",
      to_location: "UET Mechanical Block",
      departure_date: new Date().toISOString().split("T")[0],
      departure_time: "8:30 AM",
      vehicle_type: "car",
      total_cost: 240,
      price_per_seat: 60,
      total_seats: 4,
      available_seats: 1,
      pickup_point: "Civil Lines Chowk opposite PSO Pump",
      notes: "Leaving sharp 8:30 AM. Trunk space available for backpacks.",
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      organizer_id: "c9f12345-6789-4abc-def0-123456789004",
      organizer_name: "Bilal Cheema",
      organizer_verified: true,
      from_location: "Wapda Town Roundabout",
      to_location: "UET Main Campus",
      departure_date: new Date().toISOString().split("T")[0],
      departure_time: "7:45 AM",
      vehicle_type: "car",
      total_cost: 400,
      price_per_seat: 100,
      total_seats: 4,
      available_seats: 3,
      pickup_point: "Wapda Town Grid Station Stop",
      notes: "Via Canal Road express route. On-time daily morning commuter.",
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      organizer_id: "c9f12345-6789-4abc-def0-123456789006",
      organizer_name: "Zainab Malik",
      organizer_verified: true,
      from_location: "Johar Town (Shaukat Khanum Chowk)",
      to_location: "UET Girls Hostel & Main Gate",
      departure_date: new Date().toISOString().split("T")[0],
      departure_time: "8:10 AM",
      vehicle_type: "car",
      total_cost: 300,
      price_per_seat: 100,
      total_seats: 3,
      available_seats: 2,
      pickup_point: "Near Shaukat Khanum Hospital Gate 2",
      notes: "Girls-only carpool split. Peaceful commute with drop at Department & Hostel.",
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      organizer_id: "c9f12345-6789-4abc-def0-123456789007",
      organizer_name: "Hamza Sheikh",
      organizer_verified: true,
      from_location: "DHA Phase 5 Commercial",
      to_location: "UET Architecture Block",
      departure_date: new Date().toISOString().split("T")[0],
      departure_time: "7:35 AM",
      vehicle_type: "car",
      total_cost: 500,
      price_per_seat: 125,
      total_seats: 4,
      available_seats: 2,
      pickup_point: "Jalal Sons DHA Phase 5",
      notes: "Fast route via Lahore Ring Road. Non-smoking ride.",
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      organizer_id: "c9f12345-6789-4abc-def0-123456789002",
      organizer_name: "Ahmed Raza",
      organizer_verified: true,
      from_location: "UET Main Gate",
      to_location: "Khurrialwala Main Chowk",
      departure_date: new Date().toISOString().split("T")[0],
      departure_time: "4:15 PM",
      vehicle_type: "rickshaw",
      total_cost: 200,
      price_per_seat: 50,
      total_seats: 4,
      available_seats: 2,
      pickup_point: "Outside Gate 3 after labs",
      notes: "Afternoon return ride after 4 PM semester labs finish.",
      status: "active",
    },
    {
      id: crypto.randomUUID(),
      organizer_id: "7547d4b2-0e67-46d3-8421-8a9e4fcbc108",
      organizer_name: "Areeba Asif",
      organizer_verified: true,
      from_location: "Model Town Link Road",
      to_location: "UET Main Campus",
      departure_date: new Date().toISOString().split("T")[0],
      departure_time: "8:00 AM",
      vehicle_type: "car",
      total_cost: 300,
      price_per_seat: 100,
      total_seats: 3,
      available_seats: 1,
      pickup_point: "Amanah Mall Entrance",
      notes: "Returning via Ferozepur Road. On-time departure.",
      status: "active",
    }
  ];

  for (const r of ridesData) {
    await client.query(`
      insert into public.rides (
        id, organizer_id, organizer_name, organizer_verified, from_location, to_location,
        departure_date, departure_time, vehicle_type, total_cost, price_per_seat, total_seats,
        available_seats, pickup_point, notes, status
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16);
    `, [
      r.id, r.organizer_id, r.organizer_name, r.organizer_verified, r.from_location, r.to_location,
      r.departure_date, r.departure_time, r.vehicle_type, r.total_cost, r.price_per_seat, r.total_seats,
      r.available_seats, r.pickup_point, r.notes, r.status
    ]);
  }
  console.log(`Seeded ${ridesData.length} rides.`);

  // Bookings
  const bookingsData = [
    { ride_id: ridesData[0].id, rider_name: "Muhammad Hammad Ismail", seats_booked: 1, cost_share: 50, status: "confirmed" },
    { ride_id: ridesData[0].id, rider_name: "Ali Hassan", seats_booked: 1, cost_share: 50, status: "confirmed" },
    { ride_id: ridesData[0].id, rider_name: "Kashif Mehmood", seats_booked: 1, cost_share: 50, status: "confirmed" },
    { ride_id: ridesData[1].id, rider_name: "Ayesha Noor", seats_booked: 1, cost_share: 70, status: "confirmed" },
    { ride_id: ridesData[1].id, rider_name: "Fatima Zahra", seats_booked: 1, cost_share: 70, status: "confirmed" },
    { ride_id: ridesData[2].id, rider_name: "Bilal Cheema", seats_booked: 1, cost_share: 60, status: "confirmed" },
    { ride_id: ridesData[2].id, rider_name: "Hamza Sheikh", seats_booked: 1, cost_share: 60, status: "confirmed" },
    { ride_id: ridesData[3].id, rider_name: "Ahmed Raza", seats_booked: 1, cost_share: 100, status: "confirmed" },
  ];

  for (const b of bookingsData) {
    await client.query(`
      insert into public.ride_bookings (ride_id, rider_name, seats_booked, cost_share, status)
      values ($1, $2, $3, $4, $5);
    `, [b.ride_id, b.rider_name, b.seats_booked, b.cost_share, b.status]);
  }
  console.log(`Seeded ${bookingsData.length} ride bookings.`);

  // 4. BIKES & BIKE RENTALS
  console.log("\n--- Seeding Bikes & Rentals ---");
  await client.query("delete from public.bike_rentals;");
  await client.query("delete from public.bikes;");

  const bikesData = [
    {
      id: crypto.randomUUID(),
      owner_id: "c9f12345-6789-4abc-def0-123456789002",
      owner_name: "Ahmed Raza",
      owner_verified: true,
      model: "Honda CD 70 (2022 Model)",
      condition: "Good condition",
      location: "Hostel Block A Cycle Stand",
      daily_rate: 300,
      deposit_amount: 1000,
      available_date: "Tomorrow",
      available_time: "8 AM – 4 PM",
      rules: "Valid driving license required. Return with same fuel level. Helmet included.",
      is_available: true,
    },
    {
      id: crypto.randomUUID(),
      owner_id: "c9f12345-6789-4abc-def0-123456789004",
      owner_name: "Bilal Cheema",
      owner_verified: true,
      model: "Yamaha YBR 125 (Self-Start)",
      condition: "Excellent condition",
      location: "Hostel Block B Parking",
      daily_rate: 380,
      deposit_amount: 1500,
      available_date: "Tomorrow",
      available_time: "8 AM – 4 PM",
      rules: "Smooth ride, front disc brakes. Strictly no rough off-road driving.",
      is_available: true,
    },
    {
      id: crypto.randomUUID(),
      owner_id: "c9f12345-6789-4abc-def0-123456789003",
      owner_name: "Usman Tariq",
      owner_verified: true,
      model: "Suzuki GS 150 (Touring Setup)",
      condition: "Like new",
      location: "Zubair Hall Courtyard",
      daily_rate: 450,
      deposit_amount: 2000,
      available_date: "Today & Tomorrow",
      available_time: "7 AM – 6 PM",
      rules: "Cruising condition with mobile holder. Return clean.",
      is_available: true,
    },
    {
      id: crypto.randomUUID(),
      owner_id: "c9f12345-6789-4abc-def0-123456789007",
      owner_name: "Hamza Sheikh",
      owner_verified: true,
      model: "Sohrab Classic Campus Bicycle",
      condition: "Good condition",
      location: "Hostel Block A Cycle Stand",
      daily_rate: 80,
      deposit_amount: 300,
      available_date: "Everyday",
      available_time: "Full Day (8 AM – 8 PM)",
      rules: "Great for quick inter-department transit. Lock and cable key included.",
      is_available: true,
    },
    {
      id: crypto.randomUUID(),
      owner_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      owner_name: "Muhammad Hammad Ismail",
      owner_verified: true,
      model: "Phoenix Mountain Bike (21-Speed Shimano Gear)",
      condition: "Like new",
      location: "Near Central Library Gate",
      daily_rate: 120,
      deposit_amount: 500,
      available_date: "Tomorrow",
      available_time: "8 AM – 5 PM",
      rules: "Equipped with front suspension and water bottle holder. Please ride on paved roads.",
      is_available: true,
    },
    {
      id: crypto.randomUUID(),
      owner_id: "7547d4b2-0e67-46d3-8421-8a9e4fcbc108",
      owner_name: "Areeba Asif",
      owner_verified: true,
      model: "Road Prince 70cc (Economy Edition)",
      condition: "Good condition",
      location: "Girls Hostel Gate 2",
      daily_rate: 280,
      deposit_amount: 1000,
      available_date: "Tomorrow",
      available_time: "9 AM – 3 PM",
      rules: "Economy commuter with 55 km/L mileage. University students only.",
      is_available: false,
    }
  ];

  for (const b of bikesData) {
    await client.query(`
      insert into public.bikes (
        id, owner_id, owner_name, owner_verified, model, condition, location,
        daily_rate, deposit_amount, available_date, available_time, rules, is_available
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
    `, [
      b.id, b.owner_id, b.owner_name, b.owner_verified, b.model, b.condition, b.location,
      b.daily_rate, b.deposit_amount, b.available_date, b.available_time, b.rules, b.is_available
    ]);
  }
  console.log(`Seeded ${bikesData.length} campus bikes.`);

  const bikeRentalsData = [
    { bike_id: bikesData[0].id, renter_name: "Sara Khan", rental_day: "Yesterday", rental_time: "8 AM – 4 PM", total_amount: 300, status: "completed" },
    { bike_id: bikesData[1].id, renter_name: "Usman Tariq", rental_day: "Tomorrow", rental_time: "8 AM – 4 PM", total_amount: 380, status: "confirmed" },
    { bike_id: bikesData[5].id, renter_name: "Ayesha Noor", rental_day: "Today", rental_time: "9 AM – 3 PM", total_amount: 280, status: "confirmed" },
  ];

  for (const br of bikeRentalsData) {
    await client.query(`
      insert into public.bike_rentals (bike_id, renter_name, rental_day, rental_time, total_amount, status)
      values ($1, $2, $3, $4, $5, $6);
    `, [br.bike_id, br.renter_name, br.rental_day, br.rental_time, br.total_amount, br.status]);
  }
  console.log(`Seeded ${bikeRentalsData.length} bike rental records.`);

  // 5. MARKETPLACE LISTINGS
  console.log("\n--- Seeding Marketplace Listings ---");
  await client.query("delete from public.listings;");

  const listingsData = [
    {
      id: crypto.randomUUID(),
      seller_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      seller_name: "Muhammad Hammad Ismail",
      seller_verified: true,
      title: "Semiconductor Phone Cooler with Dual Fan & RGB",
      description: "Fast thermoelectric cooling phone radiator. Drops mobile temperature by 15°C in 30 seconds. Ideal for gaming and warm hostel rooms. Includes Type-C braided cable.",
      category: "Electronics",
      price: 1800,
      condition: "Like new",
      location: "Hostel Block B Room 108",
      is_graduation_sale: false,
      status: "available",
      image_url: "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: crypto.randomUUID(),
      seller_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      seller_name: "Muhammad Hammad Ismail",
      seller_verified: true,
      title: "Solid Wood Study Table with 2-Tier Bookshelf",
      description: "Sturdy wooden table used for 2 semesters. Spacious 4x2 ft surface fits laptop, monitor, and notebooks with ease. Self-pickup from Hostel Block A.",
      category: "Furniture",
      price: 2000,
      condition: "Good",
      location: "Hostel Block A 2nd Floor",
      is_graduation_sale: true,
      status: "available",
      image_url: "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: crypto.randomUUID(),
      seller_id: "c9f12345-6789-4abc-def0-123456789001",
      seller_name: "Sara Khan",
      seller_verified: true,
      title: "Ergonomic Mesh Study Chair with Lumbar Support",
      description: "Breathable mesh back chair with pneumatic height adjustment and smooth caster wheels. Shifting to day-scholar residence, priced to clear.",
      category: "Furniture",
      price: 3200,
      condition: "Good",
      location: "Hostel Block B",
      is_graduation_sale: true,
      status: "available",
      image_url: "https://images.unsplash.com/photo-1580481077195-c3a821a5060f?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: crypto.randomUUID(),
      seller_id: "c9f12345-6789-4abc-def0-123456789002",
      seller_name: "Ahmed Raza",
      seller_verified: true,
      title: "Dell 24-inch Full HD IPS Monitor (75Hz, HDMI/VGA)",
      description: "Crisp 1080p IPS display with eye-saver blue light filter. Perfect for programming, CAD layouts, and gaming. Comes in original box with HDMI cable.",
      category: "Electronics",
      price: 15000,
      condition: "Good",
      location: "Near UET Gate 3",
      is_graduation_sale: false,
      status: "reserved",
      image_url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: crypto.randomUUID(),
      seller_id: "c9f12345-6789-4abc-def0-123456789003",
      seller_name: "Usman Tariq",
      seller_verified: true,
      title: "Haier Compact Mini Fridge for Hostel Room",
      description: "Low noise, energy-efficient mini refrigerator. Freezes ice cubes quickly and keeps drinks and fruits cold. Fits perfectly under hostel bunk beds.",
      category: "Hostel",
      price: 9500,
      condition: "Fair",
      location: "Hostel Block A Room 214",
      is_graduation_sale: true,
      status: "available",
      image_url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: crypto.randomUUID(),
      seller_id: "c9f12345-6789-4abc-def0-123456789005",
      seller_name: "Ayesha Noor",
      seller_verified: true,
      title: "Thomas' Calculus (14th Edition Metric Version)",
      description: "Complete calculus reference textbook for 1st & 2nd semester engineering courses. Clean pages, no torn leaves. Includes solved exercise bookmarks.",
      category: "Books",
      price: 650,
      condition: "Good",
      location: "Library Cafeteria",
      is_graduation_sale: false,
      status: "available",
      image_url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: crypto.randomUUID(),
      seller_id: "c9f12345-6789-4abc-def0-123456789002",
      seller_name: "Ahmed Raza",
      seller_verified: true,
      title: "Sedra & Smith Microelectronic Circuits (8th Edition)",
      description: "Essential core textbook for Electrical, Telecom, and Computer Engineering electronics sequence. Like new condition with hardback cover.",
      category: "Books",
      price: 800,
      condition: "Like new",
      location: "Electrical Engineering Dept",
      is_graduation_sale: false,
      status: "available",
      image_url: "https://images.unsplash.com/photo-1532012164546-f432f2e3dd48?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: crypto.randomUUID(),
      seller_id: "c9f12345-6789-4abc-def0-123456789004",
      seller_name: "Bilal Cheema",
      seller_verified: true,
      title: "A0 Engineering Drawing Board with 36-inch T-Square",
      description: "Smooth pine-wood drawing board with metal edge binding and adjustable tilt stand. Mandatory tool for 1st year engineering graphics and drawing lab.",
      category: "Other",
      price: 1400,
      condition: "Good",
      location: "Hostel Block B",
      is_graduation_sale: true,
      status: "available",
      image_url: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: crypto.randomUUID(),
      seller_id: "c9f12345-6789-4abc-def0-123456789006",
      seller_name: "Zainab Malik",
      seller_verified: true,
      title: "Rechargeable LED Desk Lamp with 3 Color Modes",
      description: "Touch-controlled eye-protection desk lamp with 4000mAh battery. Lasts 8 hours on backup during hostel loadshedding. USB-C rechargeable.",
      category: "Electronics",
      price: 1200,
      condition: "New",
      location: "Girls Hostel Block 1",
      is_graduation_sale: false,
      status: "available",
      image_url: "https://images.unsplash.com/photo-1534972195531-a756b1126f24?auto=format&fit=crop&w=400&q=80",
    },
    {
      id: crypto.randomUUID(),
      seller_id: "c9f12345-6789-4abc-def0-123456789007",
      seller_name: "Hamza Sheikh",
      seller_verified: true,
      title: "Single Bed High-Density Foam Mattress (3x6 ft)",
      description: "Clean hostel bed mattress with removable zippered cover. Orthopedic high density foam, used for 1 semester.",
      category: "Hostel",
      price: 2400,
      condition: "Good",
      location: "Zubair Hall Room 12",
      is_graduation_sale: true,
      status: "sold",
      image_url: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=400&q=80",
    }
  ];

  for (const l of listingsData) {
    await client.query(`
      insert into public.listings (
        id, seller_id, seller_name, seller_verified, title, description, category,
        price, condition, location, is_graduation_sale, status, image_url
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13);
    `, [
      l.id, l.seller_id, l.seller_name, l.seller_verified, l.title, l.description, l.category,
      l.price, l.condition, l.location, l.is_graduation_sale, l.status, l.image_url
    ]);
  }
  console.log(`Seeded ${listingsData.length} marketplace listings.`);

  // 6. SHARED CO-OWNED ITEMS & OWNERS
  console.log("\n--- Seeding Shared Items & Owners ---");
  await client.query("delete from public.shared_item_owners;");
  await client.query("delete from public.shared_items;");

  const sharedItems = [
    {
      id: crypto.randomUUID(),
      title: "Semiconductor Phone Cooler (Hostel Room 108)",
      total_cost: 4000,
      current_valuation: 2200,
      status: "active",
      owners: [
        { name: "Ali", initial: "A", contribution_amount: 1000, share_percentage: 25 },
        { name: "Ahmed", initial: "A", contribution_amount: 1000, share_percentage: 25 },
        { name: "Hassan", initial: "H", contribution_amount: 1000, share_percentage: 25 },
        { name: "Usman", initial: "U", contribution_amount: 1000, share_percentage: 25 },
      ]
    },
    {
      id: crypto.randomUUID(),
      title: "Dawlance Mini Fridge (Hostel Block B Room 212)",
      total_cost: 15000,
      current_valuation: 11500,
      status: "active",
      owners: [
        { name: "Muhammad Hammad", initial: "M", contribution_amount: 5000, share_percentage: 33 },
        { name: "Bilal Cheema", initial: "B", contribution_amount: 5000, share_percentage: 33 },
        { name: "Hamza Sheikh", initial: "H", contribution_amount: 5000, share_percentage: 34 },
      ]
    },
    {
      id: crypto.randomUUID(),
      title: "Hot & Cold Electric Water Dispenser (Girls Hostel Room 14)",
      total_cost: 8000,
      current_valuation: 6000,
      status: "active",
      owners: [
        { name: "Sara Khan", initial: "S", contribution_amount: 4000, share_percentage: 50 },
        { name: "Areeba Asif", initial: "A", contribution_amount: 4000, share_percentage: 50 },
      ]
    }
  ];

  for (const item of sharedItems) {
    await client.query(`
      insert into public.shared_items (id, title, total_cost, current_valuation, status)
      values ($1, $2, $3, $4, $5);
    `, [item.id, item.title, item.total_cost, item.current_valuation, item.status]);

    for (const owner of item.owners) {
      await client.query(`
        insert into public.shared_item_owners (item_id, owner_name, owner_initial, contribution_amount, share_percentage)
        values ($1, $2, $3, $4, $5);
      `, [item.id, owner.name, owner.initial, owner.contribution_amount, owner.share_percentage]);
    }
  }
  console.log(`Seeded ${sharedItems.length} shared co-owned items with owners.`);

  // 7. HOSTEL ROOMMATES & SERVICES
  console.log("\n--- Seeding Hostel Roommates & Services ---");
  await client.query("delete from public.hostel_roommates;");
  await client.query("delete from public.hostel_services;");

  const roommatesData = [
    {
      user_name: "Muhammad Hammad",
      is_verified: true,
      title: "1 Vacant Seat in Block A (3rd Floor Corner Room)",
      room_type: "Shared Room (2 students)",
      monthly_rent: 7500,
      available_from: "Immediate",
      hostel_block: "Hostel Block A",
      status: "available",
    },
    {
      user_name: "Usman Tariq",
      is_verified: true,
      title: "1 Seat in Block B with Balcony View",
      room_type: "Shared Room (2 students)",
      monthly_rent: 8000,
      available_from: "1st of next month",
      hostel_block: "Hostel Block B",
      status: "available",
    },
    {
      user_name: "Bilal Cheema",
      is_verified: true,
      title: "Ground Floor Room Vacancy in Zubair Hall",
      room_type: "Shared Room (3 students)",
      monthly_rent: 6500,
      available_from: "Immediate",
      hostel_block: "Zubair Hall",
      status: "available",
    },
    {
      user_name: "Areeba Asif",
      is_verified: true,
      title: "Girls Hostel Block 2 — Quiet Study Room Vacancy",
      room_type: "Double Occupancy",
      monthly_rent: 8500,
      available_from: "Next week",
      hostel_block: "Girls Hostel Block 2",
      status: "available",
    }
  ];

  for (const rm of roommatesData) {
    await client.query(`
      insert into public.hostel_roommates (user_name, is_verified, title, room_type, monthly_rent, available_from, hostel_block, status)
      values ($1, $2, $3, $4, $5, $6, $7, $8);
    `, [rm.user_name, rm.is_verified, rm.title, rm.room_type, rm.monthly_rent, rm.available_from, rm.hostel_block, rm.status]);
  }
  console.log(`Seeded ${roommatesData.length} hostel roommate listings.`);

  const servicesData = [
    {
      provider_name: "Hamza Sheikh",
      service_name: "Laundry Pickup & Next-Day Press",
      location: "Hostel Block A",
      turnaround_time: "Next-day return",
      is_verified: true,
    },
    {
      provider_name: "Ali Raza",
      service_name: "Laptop Repair, Linux & Windows Setup",
      location: "Hostel Block B",
      turnaround_time: "Same-day (3-4 hours)",
      is_verified: true,
    },
    {
      provider_name: "Bilal Cheema",
      service_name: "Urgent Document & Lab Manual Printing",
      location: "Near Central Library",
      turnaround_time: "Within 30 minutes",
      is_verified: true,
    },
    {
      provider_name: "Usama Tariq",
      service_name: "Campus Bicycle Tune-Up & Puncture Repair",
      location: "Hostel Block A Cycle Stand",
      turnaround_time: "1 hour turnaround",
      is_verified: true,
    }
  ];

  for (const s of servicesData) {
    await client.query(`
      insert into public.hostel_services (provider_name, service_name, location, turnaround_time, is_verified)
      values ($1, $2, $3, $4, $5);
    `, [s.provider_name, s.service_name, s.location, s.turnaround_time, s.is_verified]);
  }
  console.log(`Seeded ${servicesData.length} hostel student services.`);

  // 8. COMMUNITY EVENTS
  console.log("\n--- Seeding Community Events ---");
  await client.query("delete from public.community_events;");

  const eventsData = [
    {
      title: "Agentic AI & Full-Stack LLM Workshop",
      organizer: "CS Society",
      event_month: "OCT",
      event_day: "7",
      event_time: "Wed, 3:00 PM",
      category: "Workshop",
      registered_count: 68,
    },
    {
      title: "Tech Career Talk: GSoC, Remote Internships & CV Reviews",
      organizer: "Placement Office & ACM UET",
      event_month: "OCT",
      event_day: "11",
      event_time: "Fri, 11:30 AM",
      category: "Seminar",
      registered_count: 142,
    },
    {
      title: "Annual Inter-Hostel Floodlit Futsal Tournament",
      organizer: "UET Sports Directorate",
      event_month: "OCT",
      event_day: "15",
      event_time: "Tue, 6:00 PM",
      category: "Sports",
      registered_count: 96,
    },
    {
      title: "ICPC Regional Coding Contest — Campus Practice Round",
      organizer: "ACM UET Student Chapter",
      event_month: "OCT",
      event_day: "20",
      event_time: "Sun, 10:00 AM",
      category: "Competition",
      registered_count: 55,
    }
  ];

  for (const ev of eventsData) {
    await client.query(`
      insert into public.community_events (title, organizer, event_month, event_day, event_time, category, registered_count)
      values ($1, $2, $3, $4, $5, $6, $7);
    `, [ev.title, ev.organizer, ev.event_month, ev.event_day, ev.event_time, ev.category, ev.registered_count]);
  }
  console.log(`Seeded ${eventsData.length} community events.`);

  // 9. VERIFICATIONS (ADMIN QUEUE)
  console.log("\n--- Seeding Admin Verification Queue ---");
  await client.query("delete from public.verifications;");

  const verificationsData = [
    {
      name: "Muhammad Hammad Ismail",
      student_id: "2023-CS-807",
      program: "BSCS",
      department: "Computer Science",
      university: "UET Lahore",
      confidence_status: "matches",
      status: "approved",
      card_photo_url: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Sara Khan",
      student_id: "2022-CS-045",
      program: "BSCS",
      department: "Computer Science",
      university: "UET Lahore",
      confidence_status: "matches",
      status: "pending",
      card_photo_url: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Bilal Raza",
      student_id: "2020-EE-089",
      program: "BSEE",
      department: "Electrical Engineering",
      university: "UET Lahore",
      confidence_status: "unclear",
      status: "pending",
      card_photo_url: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Usman Tariq",
      student_id: "2023-ME-112",
      program: "BSME",
      department: "Mechanical Engineering",
      university: "UET Lahore",
      confidence_status: "matches",
      status: "pending",
      card_photo_url: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Hamza Sheikh",
      student_id: "2022-ARCH-033",
      program: "B.Arch",
      department: "Architecture",
      university: "UET Lahore",
      confidence_status: "unreadable",
      status: "reupload",
      card_photo_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=400&q=80",
    },
    {
      name: "Areeba Asif",
      student_id: "2023-CS-805",
      program: "BSCS",
      department: "Computer Science",
      university: "UET Lahore",
      confidence_status: "matches",
      status: "approved",
      card_photo_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
    }
  ];

  for (const v of verificationsData) {
    await client.query(`
      insert into public.verifications (name, student_id, program, department, university, confidence_status, status, card_photo_url)
      values ($1, $2, $3, $4, $5, $6, $7, $8);
    `, [v.name, v.student_id, v.program, v.department, v.university, v.confidence_status, v.status, v.card_photo_url]);
  }
  console.log(`Seeded ${verificationsData.length} verification requests in queue.`);

  // 10. REDDIT COMMUNITIES & POSTS & COMMENTS
  console.log("\n--- Seeding Communities, Posts, Comments & Votes ---");
  await client.query("delete from public.post_votes;");
  await client.query("delete from public.community_comments;");
  await client.query("delete from public.community_posts;");
  await client.query("delete from public.community_members;");
  await client.query("delete from public.communities;");

  const communitiesData = [
    {
      id: crypto.randomUUID(),
      name: "r/cs-uet",
      title: "UET Computer Science & Software Devs",
      description: "Official hub for UET CS students, coding projects, lab solutions, internships, and tech talks.",
      category: "Academic",
      icon: "Code",
      banner_color: "#18181B",
      member_count: 1420,
      rules: ["Be respectful and collaborative", "No plagiarism or honor-code violations", "Tag posts with appropriate flair (Resource, Question, Discussion)"]
    },
    {
      id: crypto.randomUUID(),
      name: "r/hostel-life",
      title: "UET Hostels (A, B, Zubair & Girls)",
      description: "Hostel life, mess reviews, room swaps, laundry notices, late-night tea spots, and survival tips.",
      category: "Hostel",
      icon: "Building2",
      banner_color: "#27272A",
      member_count: 890,
      rules: ["Keep hostel room drama civil", "Verify room availability details before agreeing", "Respect room privacy and curfew timings"]
    },
    {
      id: crypto.randomUUID(),
      name: "r/commute-splits",
      title: "Daily Rides & Rickshaw Splits",
      description: "Coordinate daily commute between Khurrialwala, Gulberg, Wapda Town, Johar Town, and UET campus.",
      category: "Commute",
      icon: "Compass",
      banner_color: "#09090B",
      member_count: 1150,
      rules: ["State exact pickup and dropoff points", "Always adhere to agreed fuel/cost share per seat", "Only verified students for carpools"]
    },
    {
      id: crypto.randomUUID(),
      name: "r/electrical-eng",
      title: "Electrical, Telecom & Electronics Hub",
      description: "Discussions on circuit analysis, MATLAB projects, power engineering, and semester projects.",
      category: "Academic",
      icon: "Zap",
      banner_color: "#18181B",
      member_count: 980,
      rules: ["Share lab schematics responsibly", "Tag questions with subject course codes", "Help juniors with hardware debugging"]
    },
    {
      id: crypto.randomUUID(),
      name: "r/exam-pastpapers",
      title: "Midterm & Final Exam Archives",
      description: "Past papers, professor hints, solved quizzes, and study drives for all engineering departments.",
      category: "Academic",
      icon: "BookOpen",
      banner_color: "#27272A",
      member_count: 1850,
      rules: ["Verify subject code and session year on files", "No unauthorized leakage of live exams", "Keep Drive links public for campus students"]
    },
    {
      id: crypto.randomUUID(),
      name: "r/career-internships",
      title: "Junior Jobs, GSoC & Internships",
      description: "Referrals, interview experiences, CV reviews, and remote tech job leads for Pakistani students.",
      category: "Careers",
      icon: "Briefcase",
      banner_color: "#18181B",
      member_count: 1280,
      rules: ["Include company name, stipend, and deadline in listings", "No unpaid exploitation roles", "Share constructive resume feedback"]
    },
    {
      id: crypto.randomUUID(),
      name: "r/campus-memes",
      title: "UET Memes & Relatable Campus Life",
      description: "8:00 AM lectures, GPA struggles, cafeteria chai, and campus culture memes.",
      category: "Campus Life",
      icon: "Smile",
      banner_color: "#09090B",
      member_count: 2450,
      rules: ["Keep banter friendly and lighthearted", "No personal attacks or targeted harassment", "OC (Original Content) appreciated"]
    },
    {
      id: crypto.randomUUID(),
      name: "r/sports-uet",
      title: "Cricket, Futsal, Gym & Badminton",
      description: "Organize evening matches on UET grounds, find gym workout partners, and inter-department sports fixtures.",
      category: "Campus Life",
      icon: "Trophy",
      banner_color: "#27272A",
      member_count: 760,
      rules: ["Specify ground location and match timing", "Bring your own kit or mention shared equipment", "Maintain sportsman spirit"]
    },
    {
      id: crypto.randomUUID(),
      name: "r/acm-uet",
      title: "ACM UET Student Chapter & Hackathons",
      description: "Competitive programming, ICPC prep, campus hackathons, and software workshops.",
      category: "Societies",
      icon: "Terminal",
      banner_color: "#18181B",
      member_count: 670,
      rules: ["Keep coding challenges clear with test cases", "Share hackathon registration deadlines early", "Support beginner programmers"]
    },
    {
      id: crypto.randomUUID(),
      name: "r/lost-and-found",
      title: "Campus Lost & Found Bulletin",
      description: "Report or recover misplaced student IDs, keys, calculators, bags, and items across campus.",
      category: "General",
      icon: "HelpCircle",
      banner_color: "#09090B",
      member_count: 530,
      rules: ["Hand over found official student cards to Department Admin or post here", "Require proof of ownership before returning valuables", "Update flair to [RESOLVED] once claimed"]
    }
  ];

  for (const c of communitiesData) {
    await client.query(`
      insert into public.communities (id, name, title, description, category, icon, banner_color, member_count, rules)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `, [c.id, c.name, c.title, c.description, c.category, c.icon, c.banner_color, c.member_count, c.rules]);
  }
  console.log(`Seeded ${communitiesData.length} subreddits/communities.`);

  // Memberships
  for (const c of communitiesData) {
    await client.query(`
      insert into public.community_members (community_id, user_id)
      values ($1, $2);
    `, [c.id, "66f4eccc-0142-48e5-a5bd-7fa4e95a338b"]);
  }

  // Posts
  const postsData = [
    {
      id: crypto.randomUUID(),
      community_id: communitiesData[0].id, // r/cs-uet
      community_name: "r/cs-uet",
      author_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      author_name: "Muhammad Hammad Ismail",
      author_student_id: "2023-CS-807",
      author_verified: true,
      title: "Tips for Operating Systems Lab 3 & Thread Synchronization",
      content: "For anyone struggling with pthread semaphores in Lab 3, remember that sem_wait decrements and blocks when 0, while sem_post increments. Shared mutex lock should always wrap critical sections in your circular buffer.",
      flair: "Resource",
      upvotes: 42,
      downvotes: 1,
      score: 41,
      comments_count: 3,
    },
    {
      id: crypto.randomUUID(),
      community_id: communitiesData[0].id, // r/cs-uet
      community_name: "r/cs-uet",
      author_id: "c9f12345-6789-4abc-def0-123456789001",
      author_name: "Sara Khan",
      author_student_id: "2022-CS-045",
      author_verified: true,
      title: "Google Summer of Code & Campus Internship Info Session",
      content: "The CS Society is hosting a panel with 4 seniors who cleared GSoC and Microsoft internships this week in the CS Seminar Hall on Wednesday at 3:00 PM. Highly recommend batch 2023 and 2024 attend!",
      flair: "Notice",
      upvotes: 78,
      downvotes: 2,
      score: 76,
      comments_count: 4,
    },
    {
      id: crypto.randomUUID(),
      community_id: communitiesData[2].id, // r/commute-splits
      community_name: "r/commute-splits",
      author_id: "c9f12345-6789-4abc-def0-123456789002",
      author_name: "Ahmed Raza",
      author_student_id: "2021-EE-104",
      author_verified: true,
      title: "Daily Rickshaw Split: Khurrialwala Main Chowk to UET Main Gate (8:00 AM)",
      content: "We have a permanent rickshaw booked every morning departing sharp at 8:00 AM. 1 seat just opened up for the semester. Cost is exactly Rs. 50/day. Direct drop at main academic block.",
      flair: "Carpool",
      upvotes: 29,
      downvotes: 0,
      score: 29,
      comments_count: 2,
    },
    {
      id: crypto.randomUUID(),
      community_id: communitiesData[1].id, // r/hostel-life
      community_name: "r/hostel-life",
      author_id: "c9f12345-6789-4abc-def0-123456789003",
      author_name: "Usman Tariq",
      author_student_id: "2022-ME-089",
      author_verified: true,
      title: "Zubair Hall Room Swap Available (1st Floor to Ground Floor)",
      content: "Currently in Room 114 (1st floor, corner room with ample ventilation). Looking to swap with anyone on the ground floor due to foot injury. Admin approval already pre-cleared.",
      flair: "Discussion",
      upvotes: 34,
      downvotes: 1,
      score: 33,
      comments_count: 3,
    },
    {
      id: crypto.randomUUID(),
      community_id: communitiesData[4].id, // r/exam-pastpapers
      community_name: "r/exam-pastpapers",
      author_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      author_name: "Muhammad Hammad Ismail",
      author_student_id: "2023-CS-807",
      author_verified: true,
      title: "Complete Midterm Solved Past Papers Drive (2020-2025) for 3rd & 4th Semesters",
      content: "Uploaded a compiled Google Drive folder containing solved past papers, handwritten notes for DLD, Data Structures, Multivariable Calculus, and Linear Algebra. Free for all UET students.",
      flair: "Resource",
      upvotes: 142,
      downvotes: 3,
      score: 139,
      comments_count: 6,
    },
    {
      id: crypto.randomUUID(),
      community_id: communitiesData[5].id, // r/career-internships
      community_name: "r/career-internships",
      author_id: "c9f12345-6789-4abc-def0-123456789006",
      author_name: "Zainab Malik",
      author_student_id: "2021-EE-012",
      author_verified: true,
      title: "3x React & Next.js Summer Intern Openings at Software House in Johar Town",
      content: "My team is hiring 3 intern developers (paid, Rs. 35,000/mo) starting June. Strong grasp of TypeScript and Tailwind required. Drop me a DM with your GitHub profile or resume link.",
      flair: "Notice",
      upvotes: 63,
      downvotes: 0,
      score: 63,
      comments_count: 4,
    },
    {
      id: crypto.randomUUID(),
      community_id: communitiesData[6].id, // r/campus-memes
      community_name: "r/campus-memes",
      author_id: "c9f12345-6789-4abc-def0-123456789004",
      author_name: "Bilal Cheema",
      author_student_id: "2023-CE-140",
      author_verified: true,
      title: "POV: You reached campus at 8:01 AM and the gatekeeper closed the gate",
      content: "The eye contact you make through the iron grill while praying the professor takes attendance at 8:15 AM instead of 8:00 AM sharp.",
      flair: "Meme",
      upvotes: 215,
      downvotes: 6,
      score: 209,
      comments_count: 8,
    },
    {
      id: crypto.randomUUID(),
      community_id: communitiesData[9].id, // r/lost-and-found
      community_name: "r/lost-and-found",
      author_id: "c9f12345-6789-4abc-def0-123456789005",
      author_name: "Ayesha Noor",
      author_student_id: "2024-CS-301",
      author_verified: true,
      title: "Found: Casio FX-991EX Calculator in Computer Dept Lab 2",
      content: "Found on Bench 4 after the afternoon 2:00 PM session. Has a small blue sticker on the back cover. Submitted to Lab Attendant uncle, or DM me to claim.",
      flair: "Notice",
      upvotes: 19,
      downvotes: 0,
      score: 19,
      comments_count: 2,
    },
    {
      id: crypto.randomUUID(),
      community_id: communitiesData[3].id, // r/electrical-eng
      community_name: "r/electrical-eng",
      author_id: "c9f12345-6789-4abc-def0-123456789002",
      author_name: "Ahmed Raza",
      author_student_id: "2021-EE-104",
      author_verified: true,
      title: "Simulink Model & Circuit Diagram for 3-Phase Inverter Project",
      content: "Shared the verified MATLAB Simulink simulation files for Power Electronics semester project. Includes harmonic THD analysis under 5% IEEE standard.",
      flair: "Resource",
      upvotes: 45,
      downvotes: 1,
      score: 44,
      comments_count: 2,
    },
    {
      id: crypto.randomUUID(),
      community_id: communitiesData[8].id, // r/acm-uet
      community_name: "r/acm-uet",
      author_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      author_name: "Muhammad Hammad Ismail",
      author_student_id: "2023-CS-807",
      author_verified: true,
      title: "Roadmap for ICPC Asia-Topi & Codeforces Candidate Master",
      content: "A structured practice guide for beginners and intermediate competitive programmers: focus on Binary Search on Answer, Graph BFS/DFS, Tree DP, and Segment Trees with Lazy Propagation.",
      flair: "Guide",
      upvotes: 95,
      downvotes: 2,
      score: 93,
      comments_count: 5,
    }
  ];

  for (const p of postsData) {
    await client.query(`
      insert into public.community_posts (
        id, community_id, community_name, author_id, author_name, author_student_id,
        author_verified, title, content, flair, upvotes, downvotes, score, comments_count
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
    `, [
      p.id, p.community_id, p.community_name, p.author_id, p.author_name, p.author_student_id,
      p.author_verified, p.title, p.content, p.flair, p.upvotes, p.downvotes, p.score, p.comments_count
    ]);
  }
  console.log(`Seeded ${postsData.length} community posts.`);

  // Post votes
  for (const p of postsData) {
    await client.query(`
      insert into public.post_votes (post_id, user_id, vote_type)
      values ($1, $2, $3);
    `, [p.id, "66f4eccc-0142-48e5-a5bd-7fa4e95a338b", 1]);
  }

  // Comments & Replies
  const rootCommentId = crypto.randomUUID();
  const commentsData = [
    {
      id: rootCommentId,
      post_id: postsData[0].id,
      parent_comment_id: null,
      author_id: "c9f12345-6789-4abc-def0-123456789004",
      author_name: "Bilal Cheema",
      author_student_id: "2023-CE-140",
      author_verified: true,
      content: "This saved my submission! Was getting deadlocks with nested mutex locks in the producer-consumer ring buffer. Thank you brother.",
      upvotes: 12,
      score: 12,
    },
    {
      id: crypto.randomUUID(),
      post_id: postsData[0].id,
      parent_comment_id: rootCommentId,
      author_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      author_name: "Muhammad Hammad Ismail",
      author_student_id: "2023-CS-807",
      author_verified: true,
      content: "Anytime! Let me know if you need help with the memory sanitizer flags too (-fsanitize=thread).",
      upvotes: 8,
      score: 8,
    },
    {
      id: crypto.randomUUID(),
      post_id: postsData[0].id,
      parent_comment_id: null,
      author_id: "c9f12345-6789-4abc-def0-123456789001",
      author_name: "Sara Khan",
      author_student_id: "2022-CS-045",
      author_verified: true,
      content: "Great breakdown! Also make sure your buffer pointers wrap with modulo operator: index = (index + 1) % BUFFER_SIZE.",
      upvotes: 15,
      score: 15,
    },
    {
      id: crypto.randomUUID(),
      post_id: postsData[2].id, // Khurrialwala ride post
      parent_comment_id: null,
      author_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      author_name: "Muhammad Hammad Ismail",
      author_student_id: "2023-CS-807",
      author_verified: true,
      content: "I take this rickshaw every morning! Ahmed bhai is super punctual and drops right in front of the CS block.",
      upvotes: 9,
      score: 9,
    },
    {
      id: crypto.randomUUID(),
      post_id: postsData[4].id, // Solved past papers
      parent_comment_id: null,
      author_id: "c9f12345-6789-4abc-def0-123456789005",
      author_name: "Ayesha Noor",
      author_student_id: "2024-CS-301",
      author_verified: true,
      content: "The DLD Karnaugh maps and finite state machine past papers are a blessing. Thank you so much seniors!",
      upvotes: 24,
      score: 24,
    }
  ];

  for (const cm of commentsData) {
    await client.query(`
      insert into public.community_comments (id, post_id, parent_comment_id, author_id, author_name, author_student_id, author_verified, content, upvotes, score)
      values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10);
    `, [cm.id, cm.post_id, cm.parent_comment_id, cm.author_id, cm.author_name, cm.author_student_id, cm.author_verified, cm.content, cm.upvotes, cm.score]);
  }
  console.log(`Seeded ${commentsData.length} community comments.`);

  // 11. PROFILE RATINGS
  console.log("\n--- Seeding Profile Ratings ---");
  await client.query("delete from public.profile_ratings;");

  const ratingsData = [
    {
      user_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b", // Hammad
      rater_id: "c9f12345-6789-4abc-def0-123456789002",
      rater_name: "Ahmed Raza",
      rater_student_id: "2021-EE-104",
      rating: 5,
      category: "commute",
      comment: "Super punctual and respectful rider on the Khurrialwala route. Always on time and shares exact fuel split without hassle. Highly recommended!",
    },
    {
      user_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b", // Hammad
      rater_id: "c9f12345-6789-4abc-def0-123456789001",
      rater_name: "Sara Khan",
      rater_student_id: "2022-CS-045",
      rating: 5,
      category: "marketplace",
      comment: "Bought an engineering study table and cooler. Item was exactly as photographed and gave a generous discount to a batchmate.",
    },
    {
      user_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b", // Hammad
      rater_id: "c9f12345-6789-4abc-def0-123456789003",
      rater_name: "Usman Tariq",
      rater_student_id: "2022-ME-089",
      rating: 5,
      category: "community",
      comment: "Active and constructive contributor in UET CS circles. Provided helpful notes for OS lab synchronization.",
    },
    // Also add ratings for string ID "u_2023_cs_807" just in case local session uses string userId
    {
      user_id: "u_2023_cs_807",
      rater_id: "c9f12345-6789-4abc-def0-123456789002",
      rater_name: "Ahmed Raza",
      rater_student_id: "2021-EE-104",
      rating: 5,
      category: "commute",
      comment: "Super punctual and respectful rider on the Khurrialwala route. Always on time and shares exact fuel split without hassle.",
    },
    {
      user_id: "u_2023_cs_807",
      rater_id: "c9f12345-6789-4abc-def0-123456789001",
      rater_name: "Sara Khan",
      rater_student_id: "2022-CS-045",
      rating: 5,
      category: "marketplace",
      comment: "Item was in top condition, polite student seller. Quick handover near campus gate.",
    },
    {
      user_id: "u_2023_cs_807",
      rater_id: "c9f12345-6789-4abc-def0-123456789004",
      rater_name: "Bilal Cheema",
      rater_student_id: "2023-CE-140",
      rating: 5,
      category: "hostel",
      comment: "Reliable room partner in hostel sharing. Respects quiet study hours.",
    }
  ];

  for (const rt of ratingsData) {
    await client.query(`
      insert into public.profile_ratings (user_id, rater_id, rater_name, rater_student_id, rating, category, comment)
      values ($1, $2, $3, $4, $5, $6, $7);
    `, [rt.user_id, rt.rater_id, rt.rater_name, rt.rater_student_id, rt.rating, rt.category, rt.comment]);
  }
  console.log(`Seeded ${ratingsData.length} profile ratings.`);

  // 12. NOTIFICATIONS
  console.log("\n--- Seeding Notifications ---");
  await client.query("delete from public.notifications;");

  const notifsData = [
    {
      user_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      type: "ride",
      title: "Ride Seat Confirmed!",
      message: "Your seat in Ahmed Raza's Khurrialwala rickshaw split (8:00 AM) is confirmed.",
      time: "10m ago",
      deeplink: "/commute",
      is_read: false,
    },
    {
      user_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      type: "market",
      title: "Buyer Inquired on Phone Cooler",
      message: "Sara Khan sent an inquiry about your Semiconductor Phone Cooler listing.",
      time: "1h ago",
      deeplink: "/market",
      is_read: false,
    },
    {
      user_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      type: "verification",
      title: "Student Card Verified",
      message: "Your UET Lahore Student ID Card has been officially verified by Campus Moderation.",
      time: "Yesterday",
      deeplink: "/profile",
      is_read: true,
    },
    {
      user_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      type: "bike",
      title: "Bike Rental Available",
      message: "The Honda CD 70 you watched is ready for pickup at Hostel Block A.",
      time: "2d ago",
      deeplink: "/bikes",
      is_read: true,
    },
    {
      user_id: "66f4eccc-0142-48e5-a5bd-7fa4e95a338b",
      type: "community",
      title: "New Reply in r/cs-uet",
      message: "Bilal Cheema replied to your thread: 'Tips for Operating Systems Lab 3'.",
      time: "3d ago",
      deeplink: "/community",
      is_read: true,
    }
  ];

  for (const n of notifsData) {
    await client.query(`
      insert into public.notifications (user_id, type, title, message, time, deeplink, is_read)
      values ($1, $2, $3, $4, $5, $6, $7);
    `, [n.user_id, n.type, n.title, n.message, n.time, n.deeplink, n.is_read]);
  }
  console.log(`Seeded ${notifsData.length} notifications.`);

  console.log("\n==========================================================");
  console.log("SUCCESS! All tables seeded with rich dummy data across all endpoints!");
  console.log("==========================================================");

  await client.end();
}

seed().catch((err) => {
  console.error("Seeding error:", err);
  process.exit(1);
});
