import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseServerClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return createClient(url, key);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    userId?: string;
    subscriptionMode?: string;
  };

  const userId = typeof body.userId === "string" ? body.userId.trim() : "";
  const subscriptionMode =
    typeof body.subscriptionMode === "string" ? body.subscriptionMode.trim() : "";

  if (!userId || !subscriptionMode) {
    return NextResponse.json(
      { error: "Missing userId or subscriptionMode" },
      { status: 400 },
    );
  }

  const allowedModes = new Set(["starter", "pro", "top"]);

  if (!allowedModes.has(subscriptionMode)) {
    return NextResponse.json({ error: "Invalid subscription mode" }, { status: 400 });
  }

  const supabase = getSupabaseServerClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase is not configured for admin updates." },
      { status: 500 },
    );
  }

  const { error } = await supabase
    .from("users")
    .update({ subscription_mode: subscriptionMode })
    .eq("id", userId);

  if (error) {
    return NextResponse.json(
      { error: "Unable to update user plan right now." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
