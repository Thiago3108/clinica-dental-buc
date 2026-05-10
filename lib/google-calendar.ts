import { google } from "googleapis";
import type { OAuth2Client } from "google-auth-library";

const CALENDAR_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

export function isGoogleCalendarConfigured() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REDIRECT_URI
  );
}

function buildOAuthClient(): OAuth2Client {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export function buildAuthUrl(specialistId: string): string {
  const client = buildOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: CALENDAR_SCOPES,
    state: specialistId,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = buildOAuthClient();
  const { tokens } = await client.getToken(code);
  return tokens;
}

export async function getPrimaryCalendarId(refreshToken: string): Promise<string> {
  const client = buildOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  const calendar = google.calendar({ version: "v3", auth: client });
  const res = await calendar.calendarList.list({ maxResults: 250 });
  const primary = res.data.items?.find((c) => c.primary);
  return primary?.id || "primary";
}

type CalendarEventInput = {
  refreshToken: string;
  calendarId: string;
  summary: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  attendeeEmail?: string | null;
};

export async function createCalendarEvent(input: CalendarEventInput): Promise<string | null> {
  if (!isGoogleCalendarConfigured()) return null;
  try {
    const client = buildOAuthClient();
    client.setCredentials({ refresh_token: input.refreshToken });
    const calendar = google.calendar({ version: "v3", auth: client });

    const res = await calendar.events.insert({
      calendarId: input.calendarId,
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: { dateTime: input.startTime, timeZone: input.timezone },
        end: { dateTime: input.endTime, timeZone: input.timezone },
        attendees: input.attendeeEmail ? [{ email: input.attendeeEmail }] : undefined,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 60 },
            { method: "popup", minutes: 1440 },
          ],
        },
      },
    });
    return res.data.id || null;
  } catch (err) {
    console.error("createCalendarEvent error:", err);
    return null;
  }
}

export async function updateCalendarEvent(
  refreshToken: string,
  calendarId: string,
  eventId: string,
  patch: Partial<{
    summary: string;
    description: string;
    startTime: string;
    endTime: string;
    timezone: string;
    status: "confirmed" | "cancelled";
  }>
): Promise<boolean> {
  if (!isGoogleCalendarConfigured()) return false;
  try {
    const client = buildOAuthClient();
    client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar({ version: "v3", auth: client });

    const requestBody: Record<string, unknown> = {};
    if (patch.summary !== undefined) requestBody.summary = patch.summary;
    if (patch.description !== undefined) requestBody.description = patch.description;
    if (patch.status !== undefined) requestBody.status = patch.status;
    if (patch.startTime && patch.timezone) {
      requestBody.start = { dateTime: patch.startTime, timeZone: patch.timezone };
    }
    if (patch.endTime && patch.timezone) {
      requestBody.end = { dateTime: patch.endTime, timeZone: patch.timezone };
    }

    await calendar.events.patch({ calendarId, eventId, requestBody });
    return true;
  } catch (err) {
    console.error("updateCalendarEvent error:", err);
    return false;
  }
}

export async function deleteCalendarEvent(
  refreshToken: string,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  if (!isGoogleCalendarConfigured()) return false;
  try {
    const client = buildOAuthClient();
    client.setCredentials({ refresh_token: refreshToken });
    const calendar = google.calendar({ version: "v3", auth: client });
    await calendar.events.delete({ calendarId, eventId });
    return true;
  } catch (err) {
    console.error("deleteCalendarEvent error:", err);
    return false;
  }
}

export async function revokeRefreshToken(refreshToken: string): Promise<boolean> {
  if (!isGoogleCalendarConfigured()) return false;
  try {
    const client = buildOAuthClient();
    await client.revokeToken(refreshToken);
    return true;
  } catch (err) {
    console.error("revokeRefreshToken error:", err);
    return false;
  }
}
