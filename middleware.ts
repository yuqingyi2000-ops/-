import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { CATEGORY_SLUGS } from "@/lib/constants";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({
            request,
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request,
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Handle category redirects for SEO-friendly URLs
  if (request.nextUrl.pathname.startsWith("/category/")) {
    const pathSegments = request.nextUrl.pathname.split("/");
    if (pathSegments.length === 3) {
      const categoryParam = decodeURIComponent(pathSegments[2]);

      // Check if this is an old category name that needs to be redirected to slug
      const categorySlug =
        CATEGORY_SLUGS[categoryParam as keyof typeof CATEGORY_SLUGS];
      if (categorySlug && categorySlug !== categoryParam) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = `/category/${categorySlug}`;
        return NextResponse.redirect(redirectUrl, 301); // Permanent redirect for SEO
      }
    }
  }

  if (!user && request.nextUrl.pathname.startsWith("/auth/protected")) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/auth/signin";
    return NextResponse.redirect(redirectUrl);
  }

  if (
    user &&
    (request.nextUrl.pathname.startsWith("/auth/signin") ||
      request.nextUrl.pathname.startsWith("/auth/signup"))
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }

  return response;
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
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|woff|woff2|ico)$).*)",
  ],
};
