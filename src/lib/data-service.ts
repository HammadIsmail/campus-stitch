"use client";

import { createClient } from "@/lib/supabase/client";

export interface Ride {
  id: string;
  university_id?: string;
  campus_id?: string;
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
  university_id?: string;
  campus_id?: string;
  seller_id?: string;
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
  university_id?: string;
  campus_id?: string;
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
  university_id?: string;
  campus_id?: string;
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
  university_id?: string;
  campus_id?: string;
  campus_name?: string;
  confidence_status: "matches" | "unreadable" | "unclear" | "expired";
  status: "pending" | "approved" | "rejected" | "reupload";
  card_photo_url?: string;
  live_photo_url?: string;
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
  async getRides(campusId?: string): Promise<Ride[]> {
    try {
      const supabase = createClient();
      let query = supabase
        .from("rides")
        .select("*")
        .order("created_at", { ascending: false });

      if (campusId) {
        query = query.eq("campus_id", campusId);
      }

      const { data, error } = await query;

      if (!error && data !== null) {
        setStored("rides", data);
        return data as Ride[];
      }
    } catch {
      // Supabase direct failed or unavailable, try API endpoint
      try {
        const res = await fetch(`/api/commute/rides${campusId ? `?campusId=${encodeURIComponent(campusId)}` : ""}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.rides)) {
          setStored("rides", json.rides);
          return json.rides as Ride[];
        }
      } catch {}
    }
    const all = getStored<Ride[]>("rides", []);
    if (!campusId) return all;
    return all.filter((r) => r.campus_id === campusId);
  },

  async createRide(ride: Omit<Ride, "id">): Promise<Ride> {
    try {
      const res = await fetch("/api/commute/rides", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(ride),
      });
      const json = await res.json();
      if (json.success && json.ride?.id) {
        const created = json.ride as Ride;
        const current = getStored<Ride[]>("rides", []);
        setStored("rides", [created, ...current]);
        return created;
      }
    } catch (err) {
      console.warn("createRide API failed, falling back to direct DB/local:", err);
    }

    const newRide: Ride = {
      ...ride,
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "r_" + Math.random().toString(36).slice(2, 9),
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
    } catch {}

    const current = getStored<Ride[]>("rides", []);
    const updated = [newRide, ...current];
    setStored("rides", updated);
    return newRide;
  },

  async bookRideSeat(
    rideId: string,
    riderName: string,
  ): Promise<{ success: boolean; available_seats: number }> {
    const current = getStored<Ride[]>("rides", []);
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
    } catch {
      try {
        await fetch("/api/commute/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rideId, riderName, seats: 1 }),
        });
      } catch {}
    }

    return { success: true, available_seats: ride.available_seats };
  },

  // ---- MARKET LISTINGS ----
  async getListings(campusId?: string): Promise<Listing[]> {
    // 1. First fetch via server API route (consistent with mobile)
    try {
      const res = await fetch(`/api/market${campusId ? `?campusId=${encodeURIComponent(campusId)}` : ""}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.listings)) {
        setStored("listings", json.listings);
        return json.listings as Listing[];
      }
    } catch {}

    // 2. Fallback to direct client supabase query
    try {
      const supabase = createClient();
      let query = supabase
        .from("listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (campusId) {
        query = query.eq("campus_id", campusId);
      }

      const { data, error } = await query;

      if (!error && data !== null) {
        setStored("listings", data);
        return data as Listing[];
      }
    } catch {}
    const all = getStored<Listing[]>("listings", []);
    if (!campusId) return all;
    return all.filter((l) => l.campus_id === campusId);
  },

  async createListing(listing: Omit<Listing, "id">): Promise<Listing> {
    // 1. Post to /api/market server route (validates mandatory image and auto-generates Postgres UUID)
    try {
      const res = await fetch("/api/market", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(listing),
      });
      const json = await res.json();
      if (json.success && json.listing?.id) {
        const created = json.listing as Listing;
        const current = getStored<Listing[]>("listings", []);
        setStored("listings", [created, ...current]);
        return created;
      }
    } catch (err) {
      console.warn("createListing API call failed:", err);
    }

    // 2. Direct DB fallback with clean UUID
    const cleanId = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : "l_" + Math.random().toString(36).slice(2, 9);
    const newListing: Listing = {
      ...listing,
      id: cleanId,
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

    const current = getStored<Listing[]>("listings", []);
    const updated = [newListing, ...current];
    setStored("listings", updated);
    return newListing;
  },

  async updateListingStatus(
    listingId: string,
    status: "available" | "reserved" | "sold",
  ): Promise<void> {
    const current = getStored<Listing[]>("listings", []);
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
  async getBikes(campusId?: string): Promise<BikeItem[]> {
    // 1. Fetch via /api/commute/bikes
    try {
      const res = await fetch(`/api/commute/bikes${campusId ? `?campusId=${encodeURIComponent(campusId)}` : ""}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.bikes)) {
        setStored("bikes", json.bikes);
        return json.bikes as BikeItem[];
      }
    } catch {}

    // 2. Direct client supabase fallback
    try {
      const supabase = createClient();
      let query = supabase.from("bikes").select("*");
      if (campusId) {
        query = query.eq("campus_id", campusId);
      }
      const { data, error } = await query;
      if (!error && data !== null) {
        setStored("bikes", data);
        return data as BikeItem[];
      }
    } catch {}
    const all = getStored<BikeItem[]>("bikes", []);
    if (!campusId) return all;
    return all.filter((b) => b.campus_id === campusId);
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
      const res = await fetch("/api/commute/bikes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bikeId, isAvailable: false }),
      });
      if (res.ok) return true;
    } catch {}

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

  async listBike(bikeData: {
    model: string;
    condition: string;
    location: string;
    dailyRate: number;
    depositAmount: number;
    rules?: string;
    imageUrl?: string;
    ownerName?: string;
    campusId?: string;
    universityId?: string;
  }): Promise<{ success: boolean; bike?: BikeItem; error?: string }> {
    try {
      const res = await fetch("/api/commute/bikes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bikeData),
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to list bike" };
    }
  },

  async deleteBike(bikeId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`/api/commute/bikes?id=${encodeURIComponent(bikeId)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      return data;
    } catch (err: any) {
      return { success: false, error: err.message || "Failed to delete bike" };
    }
  },

  // ---- SHARED ITEMS ----
  async getSharedItems(campusId?: string): Promise<SharedItem[]> {
    try {
      const supabase = createClient();
      let query = supabase.from("shared_items").select("*");
      if (campusId) {
        query = query.eq("campus_id", campusId);
      }
      const { data: items, error: itemsError } = await query;
      const { data: owners, error: ownersError } = await supabase
        .from("shared_item_owners")
        .select("*");

      if (!itemsError && items !== null) {
        const mapped: SharedItem[] = items.map((it) => {
          const itemOwners = (owners || [])
            .filter((o) => o.item_id === it.id)
            .map((o) => ({
              id: o.id,
              name: o.owner_name,
              initial: o.owner_initial,
              contribution_amount: Number(o.contribution_amount),
              share_percentage: Number(o.share_percentage),
            }));
          return {
            id: it.id,
            university_id: it.university_id,
            campus_id: it.campus_id,
            title: it.title,
            total_cost: Number(it.total_cost),
            current_valuation: Number(it.current_valuation),
            status: it.status,
            owners: itemOwners,
          };
        });
        setStored("shared_items", mapped);
        return mapped;
      }
    } catch {}
    const all = getStored<SharedItem[]>("shared_items", []);
    if (!campusId) return all;
    return all.filter((s) => s.campus_id === campusId || (!s.campus_id && campusId === "camp_uet_main"));
  },

  async addSharedOwner(
    itemId: string,
    ownerName: string,
    amount: number,
  ): Promise<SharedItem | null> {
    const items = await this.getSharedItems();
    const item = items.find((i) => i.id === itemId);
    if (!item) return null;

    const totalContribution =
      item.owners.reduce((sum, o) => sum + o.contribution_amount, 0) + amount;
    const initial = ownerName.charAt(0).toUpperCase() || "S";
    const sharePercentage = Math.round((amount / totalContribution) * 100);

    const newOwner: SharedOwner = {
      id: "o_" + Math.random().toString(36).slice(2, 7),
      name: ownerName,
      initial,
      contribution_amount: amount,
      share_percentage: sharePercentage,
    };

    item.owners.push(newOwner);
    // Recalculate percentage shares
    item.owners.forEach((o) => {
      o.share_percentage = Math.round(
        (o.contribution_amount / totalContribution) * 100,
      );
    });

    setStored("shared_items", items);

    try {
      const supabase = createClient();
      await supabase.from("shared_item_owners").insert([
        {
          item_id: itemId,
          owner_name: ownerName,
          owner_initial: initial,
          contribution_amount: amount,
          share_percentage: sharePercentage,
        },
      ]);
    } catch {}

    return item;
  },

  // ---- VERIFICATIONS (ADMIN & STUDENT) ----
  async getVerifications(): Promise<VerificationRequest[]> {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.from("verifications").select("*");
      if (!error && data !== null) {
        setStored("verifications", data);
        return data as VerificationRequest[];
      }
    } catch {}
    return getStored<VerificationRequest[]>(
      "verifications",
      [],
    );
  },

  async updateVerificationStatus(
    id: string,
    status: "pending" | "approved" | "rejected" | "reupload",
  ): Promise<void> {
    const queue = getStored<VerificationRequest[]>(
      "verifications",
      [],
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
