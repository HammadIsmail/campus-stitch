import fs from "fs";
import path from "path";

export interface AppVersionInfo {
  latestVersion: string;
  buildNumber: number;
  minSupportedVersion: string;
  minSupportedBuild: number;
  forceUpdate: boolean;
  title: string;
  releaseNotes: string;
  apkDownloadUrl: string;
  fileSize: string;
  releasedAt: string;
  updatedBy: string;
}

const STORAGE_FILE = path.join(process.cwd(), "app-version-cache.json");

const DEFAULT_VERSION_INFO: AppVersionInfo = {
  latestVersion: "1.0.0",
  buildNumber: 1,
  minSupportedVersion: "1.0.0",
  minSupportedBuild: 1,
  forceUpdate: false,
  title: "Welcome to CampuStitch v1.0.0",
  releaseNotes: "• Initial production release\n• Multi-campus carpool, market, and hostel finder\n• Verified student identity badge & peer chats",
  apkDownloadUrl: "https://drive.usercontent.google.com/download?id=1-WdkrZmDsuQBogTFdAZwGTMhTOdmPbqU&export=download&authuser=0",
  fileSize: "50.2 MB",
  releasedAt: "2026-10-24T00:00:00.000Z",
  updatedBy: "system",
};

function loadStorage(): AppVersionInfo {
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const content = fs.readFileSync(STORAGE_FILE, "utf-8");
      const data = JSON.parse(content);
      if (data && typeof data.latestVersion === "string") {
        return { ...DEFAULT_VERSION_INFO, ...data };
      }
    }
  } catch (err) {
    console.warn("Could not read app version storage, using fallback:", err);
  }

  saveStorage(DEFAULT_VERSION_INFO);
  return DEFAULT_VERSION_INFO;
}

function saveStorage(data: AppVersionInfo): void {
  try {
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.warn("Could not write app version storage to disk:", err);
  }
}

export const AppVersionStore = {
  getVersionInfo(): AppVersionInfo {
    return loadStorage();
  },

  updateVersionInfo(updates: Partial<AppVersionInfo>, updatedBy: string): AppVersionInfo {
    const current = loadStorage();
    const updated: AppVersionInfo = {
      ...current,
      ...updates,
      updatedBy: updatedBy || current.updatedBy,
      releasedAt: new Date().toISOString(),
    };
    saveStorage(updated);
    return updated;
  },
};
