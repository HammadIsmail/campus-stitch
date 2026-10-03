"use client";

import { createClient } from "@/lib/supabase/client";

export interface Ride {
  id: string;
  organizer_name: string;
  organizer_verified: boolean;
  from_location: string;
  to_location: string;
  departure_time: string;
  departure_date?: string;
  vehicle_type: "rickshaw" | "bike" | "car";
  total_cost: number;
  price_per_seat: number;
  total_seats: number;
  available_seats: number;
  pickup_point?: string;
  notes?: string;
  status: "active" | "completed" | "cancelled";
  created_at?: string;
}

export interface Listing {
  id: string;
  seller_name: string;
  seller_verified: boolean;
  title: string;
  description?: string;
  category: "Electronics" | "Hostel" | "Books" | "Furniture" | "Other";
  price: number;
  condition: "New" | "Like new" | "Good" | "Fair";
  location: string;
  is_graduation_sale?: boolean;
  status: "available" | "reserved" | "sold";
  image_url?: string;
  created_at?: string;
}

export interface BikeItem {
  id: string;
  owner_name: string;
  owner_verified: boolean;
  model: string;
  condition: string;
  location: string;
  daily_rate: number;
  deposit_amount: number;
  available_date: string;
  available_time: string;
  rules: string;
  is_available: boolean;
}

export interface SharedOwner {
  id: string;
  name: string;
  initial: string;
  contribution_amount: number;
  share_percentage: number;
}

export interface SharedItem {
  id: string;
  title: string;
  total_cost: number;
  current_valuation: number;
  status: "active" | "for_sale" | "sold";
  owners: SharedOwner[];
}

export interface VerificationRequest {
  id: string;
  name: string;
  student_id: string;
  program: string;
  department: string;
  university: string;
  confidence_status: "matches" | "unreadable" | "unclear" | "expired";
  status: "pending" | "approved" | "rejected" | "reupload";
  card_photo_url?: string;
  created_at?: string;
}

// Initial Seed Data - Empty by default for live testing
const SEED_RIDES: Ride[] = [];
const SEED_LISTINGS: Listing[] = [];
const SEED_BIKES: BikeItem[] = [];
const SEED_SHARED_ITEMS: SharedItem[] = [];
const SEED_VERIFICATIONS: VerificationRequest[] = [];

// Helper to safely access localStorage in client
function getStored<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;
  try {
    const item = localStorage.getItem(`campus_stitch_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(`campus_stitch_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// ========================================================
// UNIFIED DATA SERVICE (Supabase + Local Sync Fallback)
// ========================================================
export const DataService = {
  // ---- RIDES ----
  async getRides(): Promise<Ride[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("rides")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0 && !error) {
        setStored("rides", data);
        return data as Ride[];
      }
    } catch {
      // Fallback
    }
    return getStored<Ride[]>("rides", SEED_RIDES);
  },

  async createRide(ride: Omit<Ride, "id">): Promise<Ride> {
    const newRide: Ride = {
      ...ride,
      id: "r_" + Math.random().toString(36).slice(2, 9),
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("rides")
        .insert([newRide])
        .select()
        .single();
      if (data && !error) {
        newRide.id = data.id;
      }
    } catch {
      // Offline fallback
    }

    const current = getStored<Ride[]>("rides", SEED_RIDES);
    const updated = [newRide, ...current];
    setStored("rides", updated);
    return newRide;
  },

  async bookRideSeat(
    rideId: string,
    riderName: string,
  ): Promise<{ success: boolean; available_seats: number }> {
    const current = getStored<Ride[]>("rides", SEED_RIDES);
    const ride = current.find((r) => r.id === rideId);
    if (!ride || ride.available_seats <= 0) {
      return { success: false, available_seats: 0 };
    }

    ride.available_seats = Math.max(0, ride.available_seats - 1);
    setStored("rides", current);

    // Save booking
    const bookings = getStored<
      { ride_id: string; rider_name: string; date: string }[]
    >("my_bookings", []);
    bookings.push({
      ride_id: rideId,
      rider_name: riderName,
      date: new Date().toISOString(),
    });
    setStored("my_bookings", bookings);

    try {
      const supabase = createClient();
      await supabase
        .from("rides")
        .update({ available_seats: ride.available_seats })
        .eq("id", rideId);
      await supabase.from("ride_bookings").insert([
        {
          ride_id: rideId,
          rider_name: riderName,
          seats_booked: 1,
          cost_share: ride.price_per_seat,
          status: "confirmed",
        },
      ]);
    } catch {}

    return { success: true, available_seats: ride.available_seats };
  },

  // ---- MARKET LISTINGS ----
  async getListings(): Promise<Listing[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (data && data.length > 0 && !error) {
        setStored("listings", data);
        return data as Listing[];
      }
    } catch {}
    return getStored<Listing[]>("listings", SEED_LISTINGS);
  },

  async createListing(listing: Omit<Listing, "id">): Promise<Listing> {
    const newListing: Listing = {
      ...listing,
      id: "l_" + Math.random().toString(36).slice(2, 9),
      created_at: new Date().toISOString(),
    };

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("listings")
        .insert([newListing])
        .select()
        .single();
      if (data && !error) {
        newListing.id = data.id;
      }
    } catch {}

    const current = getStored<Listing[]>("listings", SEED_LISTINGS);
    const updated = [newListing, ...current];
    setStored("listings", updated);
    return newListing;
  },

  async updateListingStatus(
    listingId: string,
    status: "available" | "reserved" | "sold",
  ): Promise<void> {
    const current = getStored<Listing[]>("listings", SEED_LISTINGS);
    const item = current.find((l) => l.id === listingId);
    if (item) {
      item.status = status;
      setStored("listings", current);
    }

    try {
      const supabase = createClient();
      await supabase.from("listings").update({ status }).eq("id", listingId);
    } catch {}
  },

  // ---- BIKES ----
  async getBikes(): Promise<BikeItem[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("bikes").select("*");
      if (data && data.length > 0 && !error) {
        setStored("bikes", data);
        return data as BikeItem[];
      }
    } catch {}
    return getStored<BikeItem[]>("bikes", SEED_BIKES);
  },

  async rentBike(bikeId: string, renterName: string): Promise<boolean> {
    const rentals = getStored<any[]>("my_bike_rentals", []);
    rentals.push({
      bike_id: bikeId,
      renter_name: renterName,
      date: new Date().toISOString(),
      status: "confirmed",
    });
    setStored("my_bike_rentals", rentals);

    try {
      const supabase = createClient();
      await supabase.from("bike_rentals").insert([
        {
          bike_id: bikeId,
          renter_name: renterName,
          status: "confirmed",
        },
      ]);
    } catch {}
    return true;
  },

  // ---- SHARED ITEMS ----
  async getSharedItems(): Promise<SharedItem[]> {
    return getStored<SharedItem[]>("shared_items", SEED_SHARED_ITEMS);
  },

  async addSharedOwner(
    itemId: string,
    ownerName: string,
    amount: number,
  ): Promise<SharedItem | null> {
    const items = getStored<SharedItem[]>("shared_items", SEED_SHARED_ITEMS);
    const item = items.find((i) => i.id === itemId);
    if (!item) return null;

    const totalContribution =
      item.owners.reduce((sum, o) => sum + o.contribution_amount, 0) + amount;
    const newOwner: SharedOwner = {
      id: "o_" + Math.random().toString(36).slice(2, 7),
      name: ownerName,
      initial: ownerName.charAt(0).toUpperCase() || "S",
      contribution_amount: amount,
      share_percentage: Math.round((amount / totalContribution) * 100),
    };

    item.owners.push(newOwner);
    // Recalculate percentage shares
    item.owners.forEach((o) => {
      o.share_percentage = Math.round(
        (o.contribution_amount / totalContribution) * 100,
      );
    });

    setStored("shared_items", items);
    return item;
  },

  // ---- VERIFICATIONS (ADMIN & STUDENT) ----
  async getVerifications(): Promise<VerificationRequest[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("verifications").select("*");
      if (data && data.length > 0 && !error) {
        setStored("verifications", data);
        return data as VerificationRequest[];
      }
    } catch {}
    return getStored<VerificationRequest[]>(
      "verifications",
      SEED_VERIFICATIONS,
    );
  },

  async updateVerificationStatus(
    id: string,
    status: "pending" | "approved" | "rejected" | "reupload",
  ): Promise<void> {
    const queue = getStored<VerificationRequest[]>(
      "verifications",
      SEED_VERIFICATIONS,
    );
    const item = queue.find((v) => v.id === id);
    if (item) {
      item.status = status;
      setStored("verifications", queue);
    }

    try {
      const supabase = createClient();
      await supabase.from("verifications").update({ status }).eq("id", id);
    } catch {}
  },

  async submitVerification(data: {
    name: string;
    student_id: string;
    program: string;
    department: string;
    university: string;
    card_photo_url?: string;
  }): Promise<VerificationRequest> {
    const newReq: VerificationRequest = {
      ...data,
      id: "v_" + Math.random().toString(36).slice(2, 9),
      confidence_status: "matches",
      status: "pending",
      created_at: new Date().toISOString(),
    };

    const queue = getStored<VerificationRequest[]>(
      "verifications",
      SEED_VERIFICATIONS,
    );
    setStored("verifications", [newReq, ...queue]);

    // Save profile state
    setStored("current_user_verified", true);

    try {
      const supabase = createClient();
      await supabase.from("verifications").insert([newReq]);
    } catch {}

    return newReq;
  },
};
