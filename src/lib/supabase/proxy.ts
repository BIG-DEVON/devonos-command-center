import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { requireSupabasePublicConfig } from "@/lib/supabase/config";

export async function refreshMorrowSupabaseSession(request: NextRequest) {
  const { url, publishableKey } = requireSupabasePublicConfig();
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  return {
    response,
    authenticated: !error && Boolean(data?.claims?.sub),
    userId: data?.claims?.sub ? String(data.claims.sub) : null,
  };
}
