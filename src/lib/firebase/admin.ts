import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getMessaging, type MulticastMessage, type SendResponse } from "firebase-admin/messaging";
import { createClient } from "@/lib/supabase/server";

// Initialize Firebase Admin SDK singleton
function getFirebaseAdminApp(): App | null {
  const existingApps = getApps();
  if (existingApps.length > 0) {
    return existingApps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  // Handle newline escapes in private key environment variables
  if (privateKey.includes("\\n")) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  try {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  } catch (err) {
    console.warn("Firebase Admin initialization notice:", err);
    return null;
  }
}

export interface SendPushParams {
  userIds: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  url?: string;
}

/**
 * Send multicast push notification to all devices registered to one or more user IDs
 */
export async function sendPushNotification({
  userIds,
  title,
  body,
  data = {},
  url,
}: SendPushParams): Promise<{ success: boolean; sentCount: number; message?: string }> {
  if (!userIds || userIds.length === 0) {
    return { success: false, sentCount: 0, message: "No recipient userIds provided" };
  }

  const app = getFirebaseAdminApp();
  if (!app) {
    console.info(
      "[PushNotifications] Firebase Admin credentials not set. Simulated notification:",
      { title, body, userIds }
    );
    return {
      success: true,
      sentCount: 0,
      message: "Firebase Admin credentials not configured yet. Notification logged.",
    };
  }

  try {
    const messaging = getMessaging(app);
    const supabase = await createClient();
    const { data: tokenRows, error } = await supabase
      .from("user_push_tokens")
      .select("token, user_id")
      .in("user_id", userIds);

    if (error || !tokenRows || tokenRows.length === 0) {
      return { success: true, sentCount: 0, message: "No device tokens found for users" };
    }

    const tokens = Array.from(new Set(tokenRows.map((r) => r.token).filter(Boolean)));
    if (tokens.length === 0) {
      return { success: true, sentCount: 0, message: "No valid tokens found" };
    }

    const payload: MulticastMessage = {
      tokens,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        click_action: url || data.click_action || "/",
        url: url || data.url || "/",
      },
      webpush: {
        fcmOptions: {
          link: url || "/",
        },
        notification: {
          icon: "/icon-192.png",
          badge: "/icon-192.png",
        },
      },
      android: {
        priority: "high",
        notification: {
          sound: "default",
          channelId: "campus_stitch_high_importance",
        },
      },
      apns: {
        payload: {
          aps: {
            sound: "default",
            badge: 1,
          },
        },
      },
    };

    const response = await messaging.sendEachForMulticast(payload);

    // Clean up dead/unregistered tokens
    const deadTokens: string[] = [];
    response.responses.forEach((resp: SendResponse, idx: number) => {
      if (!resp.success && resp.error) {
        const code = resp.error.code;
        if (
          code === "messaging/invalid-registration-token" ||
          code === "messaging/registration-token-not-registered"
        ) {
          deadTokens.push(tokens[idx]);
        }
      }
    });

    if (deadTokens.length > 0) {
      await supabase.from("user_push_tokens").delete().in("token", deadTokens);
    }

    return {
      success: true,
      sentCount: response.successCount,
    };
  } catch (err) {
    console.error("Failed to send push notifications:", err);
    return {
      success: false,
      sentCount: 0,
      message: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
