import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Where the sign-in email link lands. Swaps the one-time code for a session, then opens the app.
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const to = new URL("/dashboard", request.url);
  if (!code) return NextResponse.redirect(new URL("/sign-in?link=invalid", request.url));
  const db = await createClient();
  const { error } = await db.auth.exchangeCodeForSession(code);
  if (error) return NextResponse.redirect(new URL("/sign-in?link=expired", request.url));
  return NextResponse.redirect(to);
}
