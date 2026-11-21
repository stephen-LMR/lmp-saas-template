import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Keeps a signed-in staff member's session fresh on every request. Does nothing when the
// app runs on demo records or has no database configured yet.
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (process.env.APP_DATA === "demo" || !url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
  const db = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      }
    }
  });
  await db.auth.getUser();
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|api/health|design|design-samples|favicon.ico).*)"]
};
