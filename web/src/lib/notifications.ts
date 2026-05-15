// Notification helper — creëert in-app notifications + verstuurt email als geconfigureerd.

import { eq, and, isNull, desc } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { env } from "@/lib/env";

export type NotificationType =
  | "request_done"
  | "request_failed"
  | "invoice_paid"
  | "invoice_overdue"
  | "trial_expiring"
  | "meta_token_expiring"
  | "client_added"
  | "integration_invalid"
  | "general";

export type CreateNotificationInput = {
  agencyId: string;
  recipientUserId?: string;
  type: NotificationType;
  title: string;
  body?: string;
  link?: string;
  metadata?: Record<string, unknown>;
  /** If true, also send via email when agency has notify_email enabled */
  sendEmail?: boolean;
};

/**
 * Create an in-app notification. Optionally also sends email.
 */
export async function createNotification(input: CreateNotificationInput) {
  const [notif] = await db
    .insert(schema.notifications)
    .values({
      agencyId: input.agencyId,
      recipientUserId: input.recipientUserId ?? null,
      type: input.type,
      title: input.title,
      body: input.body ?? null,
      link: input.link ?? null,
      metadata: input.metadata ?? {},
    })
    .returning();

  if (input.sendEmail) {
    void sendNotificationEmail(notif.id).catch((err) => {
      console.error("[notification email]", err);
    });
  }

  return notif;
}

/**
 * Send a notification via Resend. Fails silently if Resend not configured.
 */
async function sendNotificationEmail(notificationId: string) {
  const apiKey = env("RESEND_API_KEY");
  const fromEmail = env("RESEND_FROM_EMAIL") ?? "Willoe <onboard@resend.dev>";
  if (!apiKey) return; // Resend optioneel

  // Load notification + agency + recipient
  const [notif] = await db
    .select({
      id: schema.notifications.id,
      title: schema.notifications.title,
      body: schema.notifications.body,
      link: schema.notifications.link,
      type: schema.notifications.type,
      agencyId: schema.notifications.agencyId,
      recipientUserId: schema.notifications.recipientUserId,
    })
    .from(schema.notifications)
    .where(eq(schema.notifications.id, notificationId))
    .limit(1);
  if (!notif) return;

  const [agency] = await db
    .select({
      id: schema.agencies.id,
      displayName: schema.agencies.displayName,
      notifyEmail: schema.agencies.notifyEmail,
      notifyEmailAddress: schema.agencies.notifyEmailAddress,
      adminUserId: schema.agencies.adminUserId,
      primaryColor: schema.agencies.primaryColor,
    })
    .from(schema.agencies)
    .where(eq(schema.agencies.id, notif.agencyId))
    .limit(1);
  if (!agency || !agency.notifyEmail) return;

  // Email goes to notify_email_address (set), or admin user
  let toEmail = agency.notifyEmailAddress;
  if (!toEmail) {
    const targetUserId = notif.recipientUserId ?? agency.adminUserId;
    if (targetUserId) {
      const [user] = await db
        .select({ email: schema.users.email })
        .from(schema.users)
        .where(eq(schema.users.id, targetUserId))
        .limit(1);
      toEmail = user?.email ?? null;
    }
  }
  if (!toEmail) return;

  const siteUrl = env("NEXT_PUBLIC_SITE_URL") ?? "http://localhost:3002";
  const linkUrl = notif.link ? (notif.link.startsWith("http") ? notif.link : `${siteUrl}${notif.link}`) : null;

  const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#fafafa;margin:0;padding:32px;">
<div style="max-width:520px;margin:0 auto;background:#fff;border:1px solid #e5e5e5;border-radius:12px;overflow:hidden;">
  <div style="padding:20px 24px;border-bottom:1px solid #f0f0f0;display:flex;align-items:center;gap:10px;">
    <div style="width:28px;height:28px;border-radius:6px;background:${agency.primaryColor};display:inline-block;text-align:center;line-height:28px;color:#fff;font-weight:700;">${agency.displayName.charAt(0).toUpperCase()}</div>
    <strong style="font-size:14px;color:#0a0a0a;">${agency.displayName}</strong>
  </div>
  <div style="padding:24px;">
    <h1 style="font-size:18px;margin:0 0 8px;color:#0a0a0a;">${notif.title}</h1>
    ${notif.body ? `<p style="font-size:14px;color:#525252;line-height:1.5;margin:0 0 16px;">${notif.body}</p>` : ""}
    ${linkUrl ? `<a href="${linkUrl}" style="display:inline-block;background:${agency.primaryColor};color:#fff;text-decoration:none;padding:10px 16px;border-radius:6px;font-size:13px;font-weight:500;">Bekijken</a>` : ""}
  </div>
  <div style="padding:16px 24px;background:#fafafa;border-top:1px solid #f0f0f0;font-size:11px;color:#a3a3a3;">
    Willoe · <a href="${siteUrl}/portal/settings" style="color:#a3a3a3;">Notificatie voorkeuren</a>
  </div>
</div>
</body></html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [toEmail],
        subject: notif.title,
        html,
      }),
    });
    if (res.ok) {
      await db
        .update(schema.notifications)
        .set({ emailSentAt: new Date() })
        .where(eq(schema.notifications.id, notificationId));
    }
  } catch (err) {
    console.error("[resend email failed]", err);
  }
}

/**
 * List notifications for a user (capped at 50).
 */
export async function listNotifications(agencyId: string, recipientUserId: string) {
  return db
    .select()
    .from(schema.notifications)
    .where(eq(schema.notifications.agencyId, agencyId))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(50);
}

export async function countUnread(agencyId: string, recipientUserId: string): Promise<number> {
  const result = await db
    .select({ id: schema.notifications.id })
    .from(schema.notifications)
    .where(
      and(eq(schema.notifications.agencyId, agencyId), isNull(schema.notifications.readAt))
    );
  return result.length;
}

export async function markAllRead(agencyId: string) {
  await db
    .update(schema.notifications)
    .set({ readAt: new Date() })
    .where(
      and(eq(schema.notifications.agencyId, agencyId), isNull(schema.notifications.readAt))
    );
}
