import { NextResponse } from "next/server";
import { getSupabaseUrl } from "@/lib/supabase/url";

export async function GET() {
  const headers = { "Cache-Control": "private, no-store" };
  const projectUrl = getSupabaseUrl();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!projectUrl || !anonKey) {
    return NextResponse.json({ error: "Sign-in is not configured." }, { status: 503, headers });
  }

  try {
    // This documented public endpoint contains provider flags, not secrets.
    // Return only the two providers the website actually offers.
    const response = await fetch(`${projectUrl}/auth/v1/settings`, {
      headers: { apikey: anonKey },
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Auth settings unavailable");
    const settings = await response.json();
    return NextResponse.json({
      google: settings.external?.google === true,
      apple: settings.external?.apple === true,
    }, { headers });
  } catch {
    return NextResponse.json({ error: "Sign-in is temporarily unavailable." }, { status: 503, headers });
  }
}
