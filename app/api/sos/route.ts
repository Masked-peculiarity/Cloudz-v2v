import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { sendSosSmsAlerts, type EmergencyContact } from "@/lib/twilio";

export async function POST(request: Request) {
  try {
    const { userId, triggerType, location, emergencyContacts } = await request.json();

    if (!userId || !triggerType || !location) {
      return NextResponse.json(
        { error: "userId, triggerType, and location are required" },
        { status: 400 }
      );
    }

    if (typeof location.lat !== "number" || typeof location.lng !== "number") {
      return NextResponse.json(
        { error: "location must include numeric lat and lng" },
        { status: 400 }
      );
    }

    const sosEventId = crypto.randomUUID();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const trackLink = `${siteUrl}/track/${sosEventId}`;

    const contacts: EmergencyContact[] = (emergencyContacts || []).map(
      (c: { name?: string; phone?: string }) => ({
        name: c.name || "Trusted Contact",
        phone: c.phone || "",
      })
    );

    const sms = await sendSosSmsAlerts(contacts, trackLink, location);

    if (isSupabaseConfigured) {
      const { data, error } = await supabase
        .from("sos_events")
        .insert({
          id: sosEventId,
          user_id: userId,
          trigger_type: triggerType,
          location_trail: [
            { lat: location.lat, lng: location.lng, timestamp: new Date().toISOString() },
          ],
          current_location: { lat: location.lat, lng: location.lng },
          contacts_notified: contacts,
          status: "active",
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json(
        {
          message: "SOS event recorded.",
          sosEventId,
          trackLink,
          sms,
          event: data,
        },
        { status: 201 }
      );
    }

    return NextResponse.json(
      {
        message: "SOS triggered (offline bypass mode).",
        sosEventId,
        triggerType,
        trackLink,
        sms,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
