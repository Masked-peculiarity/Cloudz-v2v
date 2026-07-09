import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase";

type SosRequestBody = {
  lat: number;
  lng: number;
  userId?: string | null;
};

export async function POST(request: Request) {
  let body: SosRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { lat, lng, userId = null } = body;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json(
      { error: "lat and lng must be numbers" },
      { status: 400 }
    );
  }

  const supabase = createServiceClient();

  const { data: eventId, error } = await supabase.rpc("create_sos_event", {
    p_user_id: userId,
    p_lat: lat,
    p_lng: lng,
    p_status: "active",
  });

  if (error) {
    console.error("create_sos_event failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // TODO(Member D): Trigger Twilio call to trusted contacts once /lib/twilio.ts exists.
  // Example:
  // import { notifyTrustedContacts } from "@/lib/twilio";
  // await notifyTrustedContacts({ sosEventId: eventId, lat, lng, userId });

  return NextResponse.json({ id: eventId }, { status: 201 });
}
