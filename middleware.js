import { createClient } from "@/utils/supabase/middleware";

export async function middleware(request) {
  const { supabase, supabaseResponse } = createClient(request);
  
  // Only attempt auth refresh if Supabase session cookies are present
  const authCookies = request.cookies.getAll().filter(c => c.name.includes('sb-'));
  if (authCookies.length > 0) {
    try {
      const { error } = await Promise.race([
        supabase.auth.getUser(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Auth timeout')), 300))
      ]);
      if (error && (error.message?.includes("fetch") || error.status === 0)) {
        authCookies.forEach(c => supabaseResponse.cookies.delete(c.name));
      }
    } catch {
      authCookies.forEach(c => supabaseResponse.cookies.delete(c.name));
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
