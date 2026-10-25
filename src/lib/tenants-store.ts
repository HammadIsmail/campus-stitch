import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface Campus {
  id: string;
  universityId: string;
  name: string;
  city: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export interface University {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  city: string;
  province: string;
  logoUrl?: string;
  campuses: Campus[];
  createdAt: string;
}

export interface CampusAdminAssignment {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  campusId: string;
  campusName: string;
  universityId: string;
  universityName: string;
  assignedBy: string;
  assignedAt: string;
}

interface TenantsStorage {
  universities: University[];
  campusAdmins: CampusAdminAssignment[];
}

const STORAGE_FILE = path.join(process.cwd(), "tenants-cache.json");

// Default initial dataset
const INITIAL_UNIVERSITIES: University[] = [
  {
    id: "uni_uet_lahore",
    name: "University of Engineering and Technology (UET) Lahore",
    shortName: "UET Lahore",
    slug: "uet-lahore",
    city: "Lahore",
    province: "Punjab",
    createdAt: "2026-01-01T00:00:00.000Z",
    campuses: [
      {
        id: "camp_uet_main",
        universityId: "uni_uet_lahore",
        name: "Main Campus (Lahore)",
        city: "Lahore",
        slug: "uet-main-lahore",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_uet_ksk",
        universityId: "uni_uet_lahore",
        name: "Kala Shah Kaku (KSK) Campus",
        city: "Kala Shah Kaku",
        slug: "uet-ksk",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_uet_fsd",
        universityId: "uni_uet_lahore",
        name: "Faisalabad Campus",
        city: "Faisalabad",
        slug: "uet-faisalabad",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_uet_nrw",
        universityId: "uni_uet_lahore",
        name: "Narowal Campus",
        city: "Narowal",
        slug: "uet-narowal",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
  {
    id: "uni_fast_nuces",
    name: "National University of Computer and Emerging Sciences (FAST-NUCES)",
    shortName: "FAST-NUCES",
    slug: "fast-nuces",
    city: "Lahore",
    province: "Punjab",
    createdAt: "2026-01-01T00:00:00.000Z",
    campuses: [
      {
        id: "camp_fast_lhr",
        universityId: "uni_fast_nuces",
        name: "Lahore Campus",
        city: "Lahore",
        slug: "fast-lahore",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_fast_isb",
        universityId: "uni_fast_nuces",
        name: "Islamabad Campus",
        city: "Islamabad",
        slug: "fast-islamabad",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_fast_khi",
        universityId: "uni_fast_nuces",
        name: "Karachi Campus",
        city: "Karachi",
        slug: "fast-karachi",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_fast_pew",
        universityId: "uni_fast_nuces",
        name: "Peshawar Campus",
        city: "Peshawar",
        slug: "fast-peshawar",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_fast_cfd",
        universityId: "uni_fast_nuces",
        name: "Chiniot-Faisalabad Campus",
        city: "Chiniot-Faisalabad",
        slug: "fast-chiniot",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
  {
    id: "uni_nust",
    name: "National University of Sciences and Technology (NUST)",
    shortName: "NUST",
    slug: "nust",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    createdAt: "2026-01-01T00:00:00.000Z",
    campuses: [
      {
        id: "camp_nust_isb",
        universityId: "uni_nust",
        name: "Islamabad (H-12 Main)",
        city: "Islamabad",
        slug: "nust-islamabad",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_nust_rwp",
        universityId: "uni_nust",
        name: "Rawalpindi (EME)",
        city: "Rawalpindi",
        slug: "nust-rawalpindi",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_nust_khi",
        universityId: "uni_nust",
        name: "Karachi (PNEC)",
        city: "Karachi",
        slug: "nust-karachi",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_nust_rsp",
        universityId: "uni_nust",
        name: "Risalpur (CAE)",
        city: "Risalpur",
        slug: "nust-risalpur",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
  {
    id: "uni_lums",
    name: "Lahore University of Management Sciences (LUMS)",
    shortName: "LUMS",
    slug: "lums",
    city: "Lahore",
    province: "Punjab",
    createdAt: "2026-01-01T00:00:00.000Z",
    campuses: [
      {
        id: "camp_lums_main",
        universityId: "uni_lums",
        name: "Main Campus (DHA)",
        city: "Lahore",
        slug: "lums-main",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
  {
    id: "uni_comsats",
    name: "COMSATS University Islamabad (CUI)",
    shortName: "COMSATS",
    slug: "comsats",
    city: "Islamabad",
    province: "Islamabad Capital Territory",
    createdAt: "2026-01-01T00:00:00.000Z",
    campuses: [
      {
        id: "camp_comsats_isb",
        universityId: "uni_comsats",
        name: "Islamabad Campus",
        city: "Islamabad",
        slug: "comsats-isb",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_comsats_lhr",
        universityId: "uni_comsats",
        name: "Lahore Campus",
        city: "Lahore",
        slug: "comsats-lhr",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_comsats_atd",
        universityId: "uni_comsats",
        name: "Abbottabad Campus",
        city: "Abbottabad",
        slug: "comsats-abbottabad",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
  {
    id: "uni_pu",
    name: "University of the Punjab (PU)",
    shortName: "Punjab University",
    slug: "pu",
    city: "Lahore",
    province: "Punjab",
    createdAt: "2026-01-01T00:00:00.000Z",
    campuses: [
      {
        id: "camp_pu_new",
        universityId: "uni_pu",
        name: "Quaid-e-Azam (New) Campus",
        city: "Lahore",
        slug: "pu-new",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_pu_old",
        universityId: "uni_pu",
        name: "Allama Iqbal (Old) Campus",
        city: "Lahore",
        slug: "pu-old",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_pu_gwa",
        universityId: "uni_pu",
        name: "Gujranwala Campus",
        city: "Gujranwala",
        slug: "pu-gujranwala",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
  {
    id: "uni_gcu",
    name: "Government College University (GCU) Lahore",
    shortName: "GCU Lahore",
    slug: "gcu",
    city: "Lahore",
    province: "Punjab",
    createdAt: "2026-01-01T00:00:00.000Z",
    campuses: [
      {
        id: "camp_gcu_main",
        universityId: "uni_gcu",
        name: "Main Campus (Katchery Road)",
        city: "Lahore",
        slug: "gcu-main",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "camp_gcu_ksk",
        universityId: "uni_gcu",
        name: "Kala Shah Kaku (KSK) Campus",
        city: "Kala Shah Kaku",
        slug: "gcu-ksk",
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
  },
];

// Helper to load data
function loadStorage(): TenantsStorage {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, "utf-8");
      const data = JSON.parse(content);
      if (data && Array.isArray(data.universities)) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Could not read tenants storage, using fallback initial data:", err);
  }

  const initial: TenantsStorage = {
    universities: INITIAL_UNIVERSITIES,
    campusAdmins: [],
  };
  saveStorage(initial);
  return initial;
}

// Helper to save data
function saveStorage(data: TenantsStorage): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write tenants storage to disk:", err);
  }
}

export const TenantsStore = {
  // 1. Get all universities with their campuses
  getUniversities(): University[] {
    const storage = loadStorage();
    return storage.universities;
  },

  // 2. Get single university by ID or slug
  getUniversity(idOrSlug: string): University | null {
    const storage = loadStorage();
    const query = idOrSlug.trim().toLowerCase();
    return (
      storage.universities.find(
        (u) => u.id.toLowerCase() === query || u.slug.toLowerCase() === query
      ) || null
    );
  },

  // 3. Add new university (Super Admin)
  addUniversity(data: {
    name: string;
    shortName: string;
    city: string;
    province: string;
    logoUrl?: string;
    initialCampuses?: { name: string; city: string }[];
  }): University {
    const storage = loadStorage();

    const slug = data.shortName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const uniId = "uni_" + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    const campuses: Campus[] = (data.initialCampuses || [{ name: "Main Campus", city: data.city }]).map(
      (c) => ({
        id: "camp_" + crypto.randomUUID().slice(0, 8),
        universityId: uniId,
        name: c.name.trim(),
        city: c.city.trim(),
        slug: (slug + "-" + c.name.toLowerCase()).replace(/[^a-z0-9]+/g, "-"),
        isActive: true,
        createdAt: now,
      })
    );

    const newUni: University = {
      id: uniId,
      name: data.name.trim(),
      shortName: data.shortName.trim(),
      slug,
      city: data.city.trim(),
      province: data.province.trim(),
      logoUrl: data.logoUrl || undefined,
      campuses,
      createdAt: now,
    };

    storage.universities.unshift(newUni);
    saveStorage(storage);
    return newUni;
  },

  // 4. Get all campuses (optionally filtered by university)
  getCampuses(universityId?: string): Campus[] {
    const storage = loadStorage();
    let all: Campus[] = [];
    for (const u of storage.universities) {
      if (!universityId || u.id === universityId || u.slug === universityId) {
        all = all.concat(u.campuses);
      }
    }
    return all;
  },

  // 5. Get single campus by ID, slug, name, or city
  getCampus(campusIdOrName: string): { campus: Campus; university: University } | null {
    if (!campusIdOrName || typeof campusIdOrName !== "string") return null;
    const storage = loadStorage();
    const clean = campusIdOrName.trim().toLowerCase();

    // 1. Direct match on id or slug
    for (const u of storage.universities) {
      const camp = u.campuses.find(
        (c) => c.id.toLowerCase() === clean || c.slug.toLowerCase() === clean
      );
      if (camp) return { campus: camp, university: u };
    }

    // 2. Exact match on name or city
    for (const u of storage.universities) {
      const camp = u.campuses.find(
        (c) => c.name.toLowerCase() === clean || c.city.toLowerCase() === clean
      );
      if (camp) return { campus: camp, university: u };
    }

    // 3. Substring match (e.g. 'faisalabad' matching 'Faisalabad Campus')
    for (const u of storage.universities) {
      const camp = u.campuses.find(
        (c) =>
          c.name.toLowerCase().includes(clean) ||
          clean.includes(c.name.toLowerCase()) ||
          c.city.toLowerCase().includes(clean) ||
          clean.includes(c.city.toLowerCase()) ||
          c.id.toLowerCase().includes(clean)
      );
      if (camp) return { campus: camp, university: u };
    }

    return null;
  },

  // 6. Add a campus to an existing university (Super Admin)
  addCampus(
    universityId: string,
    data: { name: string; city: string }
  ): Campus | null {
    const storage = loadStorage();
    const uni = storage.universities.find(
      (u) => u.id === universityId || u.slug === universityId
    );
    if (!uni) return null;

    const campId = "camp_" + crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();
    const slug = (uni.slug + "-" + data.name.toLowerCase()).replace(/[^a-z0-9]+/g, "-");

    const newCampus: Campus = {
      id: campId,
      universityId: uni.id,
      name: data.name.trim(),
      city: data.city.trim(),
      slug,
      isActive: true,
      createdAt: now,
    };

    uni.campuses.push(newCampus);
    saveStorage(storage);
    return newCampus;
  },

  // 7. Toggle campus active status (Super Admin)
  toggleCampusActive(campusId: string, isActive: boolean): boolean {
    const storage = loadStorage();
    for (const u of storage.universities) {
      const camp = u.campuses.find((c) => c.id === campusId);
      if (camp) {
        camp.isActive = isActive;
        saveStorage(storage);
        return true;
      }
    }
    return false;
  },

  // 8. Get all Campus Admins
  getCampusAdmins(campusId?: string): CampusAdminAssignment[] {
    const storage = loadStorage();
    if (campusId) {
      return storage.campusAdmins.filter((a) => a.campusId === campusId);
    }
    return storage.campusAdmins;
  },

  // 9. Check if a user is a Campus Admin
  getCampusAdminForUser(userIdentifier: string): CampusAdminAssignment | null {
    const storage = loadStorage();
    const cleanId = userIdentifier.trim().toLowerCase();
    return (
      storage.campusAdmins.find(
        (a) =>
          a.userId.toLowerCase() === cleanId ||
          a.userEmail.toLowerCase() === cleanId
      ) || null
    );
  },

  // 10. Assign Campus Admin (Super Admin)
  assignCampusAdmin(data: {
    userId: string;
    userEmail: string;
    userName: string;
    campusId: string;
    assignedBy: string;
  }): CampusAdminAssignment | null {
    const storage = loadStorage();
    const campusInfo = this.getCampus(data.campusId);
    if (!campusInfo) return null;

    // Remove any previous assignment for this user
    storage.campusAdmins = storage.campusAdmins.filter(
      (a) =>
        a.userId !== data.userId &&
        a.userEmail.toLowerCase() !== data.userEmail.toLowerCase()
    );

    const assignment: CampusAdminAssignment = {
      id: "ca_" + crypto.randomUUID().slice(0, 8),
      userId: data.userId,
      userEmail: data.userEmail.toLowerCase().trim(),
      userName: data.userName.trim(),
      campusId: campusInfo.campus.id,
      campusName: campusInfo.campus.name,
      universityId: campusInfo.university.id,
      universityName: campusInfo.university.shortName,
      assignedBy: data.assignedBy,
      assignedAt: new Date().toISOString(),
    };

    storage.campusAdmins.unshift(assignment);
    saveStorage(storage);
    return assignment;
  },

  // 11. Revoke Campus Admin (Super Admin)
  revokeCampusAdmin(userIdOrEmail: string): boolean {
    const storage = loadStorage();
    const clean = userIdOrEmail.trim().toLowerCase();
    const initialLen = storage.campusAdmins.length;
    storage.campusAdmins = storage.campusAdmins.filter(
      (a) => a.userId.toLowerCase() !== clean && a.userEmail.toLowerCase() !== clean
    );
    const changed = storage.campusAdmins.length !== initialLen;
    if (changed) {
      saveStorage(storage);
    }
    return changed;
  },

  // 12. Update University details (Super Admin)
  updateUniversity(
    id: string,
    data: {
      name?: string;
      shortName?: string;
      city?: string;
      province?: string;
      logoUrl?: string;
    }
  ): University | null {
    const storage = loadStorage();
    const uni = storage.universities.find((u) => u.id === id);
    if (!uni) return null;

    if (data.name) uni.name = data.name.trim();
    if (data.shortName) {
      uni.shortName = data.shortName.trim();
      uni.slug = uni.shortName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
    if (data.city) uni.city = data.city.trim();
    if (data.province) uni.province = data.province.trim();
    if (data.logoUrl !== undefined) uni.logoUrl = data.logoUrl || undefined;

    // Also update cached universityName on any assigned admins
    storage.campusAdmins.forEach((admin) => {
      if (admin.universityId === uni.id) {
        admin.universityName = uni.shortName;
      }
    });

    saveStorage(storage);
    return uni;
  },

  // 13. Delete University and its campuses (Super Admin)
  deleteUniversity(id: string): boolean {
    const storage = loadStorage();
    const initialLen = storage.universities.length;
    storage.universities = storage.universities.filter((u) => u.id !== id);

    if (storage.universities.length === initialLen) {
      return false;
    }

    // Remove any campus admins assigned to this university
    storage.campusAdmins = storage.campusAdmins.filter((a) => a.universityId !== id);

    saveStorage(storage);
    return true;
  },

  // 14. Update Campus details (Super Admin)
  updateCampus(
    campusId: string,
    data: { name?: string; city?: string }
  ): Campus | null {
    const storage = loadStorage();
    for (const u of storage.universities) {
      const camp = u.campuses.find((c) => c.id === campusId);
      if (camp) {
        if (data.name) {
          camp.name = data.name.trim();
          camp.slug = (u.slug + "-" + camp.name.toLowerCase()).replace(/[^a-z0-9]+/g, "-");
        }
        if (data.city) {
          camp.city = data.city.trim();
        }

        // Update cached campusName on assigned admins
        storage.campusAdmins.forEach((admin) => {
          if (admin.campusId === camp.id) {
            admin.campusName = camp.name;
          }
        });

        saveStorage(storage);
        return camp;
      }
    }
    return null;
  },

  // 15. Delete Campus (Super Admin)
  deleteCampus(campusId: string): boolean {
    const storage = loadStorage();
    for (const u of storage.universities) {
      const initialCampLen = u.campuses.length;
      u.campuses = u.campuses.filter((c) => c.id !== campusId);
      if (u.campuses.length !== initialCampLen) {
        // Also remove admin assignment for this campus
        storage.campusAdmins = storage.campusAdmins.filter((a) => a.campusId !== campusId);
        saveStorage(storage);
        return true;
      }
    }
    return false;
  },
};
