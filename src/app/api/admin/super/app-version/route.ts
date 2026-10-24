import { NextRequest, NextResponse } from "next/server";
import { AppVersionStore } from "@/lib/app-version-store";
import { sendPushNotification } from "@/lib/firebase/admin";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const version = AppVersionStore.getVersionInfo();
    return NextResponse.json({ success: true, version });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminEmail = req.headers.get("x-user-email") || "super_admin";
    const body = await req.json();

    const {
      latestVersion,
      buildNumber,
      minSupportedVersion,
      minSupportedBuild,
      forceUpdate,
      title,
      releaseNotes,
      apkDownloadUrl,
      fileSize,
      broadcastPush,
    } = body;

    if (!latestVersion || !apkDownloadUrl) {
      return NextResponse.json(
        { success: false, error: "latestVersion and apkDownloadUrl are required" },
        { status: 400 }
      );
    }

    const updated = AppVersionStore.updateVersionInfo(
      {
        latestVersion: String(latestVersion).trim(),
        buildNumber: Number(buildNumber) || 1,
        minSupportedVersion: String(minSupportedVersion || latestVersion).trim(),
        minSupportedBuild: Number(minSupportedBuild) || Number(buildNumber) || 1,
        forceUpdate: Boolean(forceUpdate),
        title: String(title || `CampuStitch v${latestVersion} Released! 🚀`).trim(),
        releaseNotes: String(releaseNotes || "Performance enhancements and bug fixes.").trim(),
        apkDownloadUrl: String(apkDownloadUrl).trim(),
        fileSize: String(fileSize || "50.2 MB").trim(),
      },
      adminEmail
    );

    let pushResult: { success?: boolean; sentCount: number; message?: string } = {
      sentCount: 0,
      message: "No push notification broadcasted",
    };

    if (broadcastPush) {
      try {
        const supabase = await createClient();
        const { data: users } = await supabase.from("profiles").select("id").limit(1000);
        if (users && users.length > 0) {
          const userIds = users.map((u) => u.id);
          pushResult = await sendPushNotification({
            userIds,
            title: updated.title,
            body: `CampuStitch v${updated.latestVersion} is now available. Tap to update your app!`,
            data: {
              type: "app_update",
              version: updated.latestVersion,
              buildNumber: String(updated.buildNumber),
              forceUpdate: String(updated.forceUpdate),
              downloadUrl: updated.apkDownloadUrl,
            },
            url: "/download",
          });
        }
      } catch (pushErr) {
        console.warn("Could not broadcast update notification:", pushErr);
      }
    }

    return NextResponse.json({
      success: true,
      version: updated,
      pushResult,
      message: `Version ${updated.latestVersion} published successfully!`,
    });
  } catch (err: any) {
    console.error("Super Admin app version update error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update app version" },
      { status: 500 }
    );
  }
}
