import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
    matcher: [
        /*
         * Match all paths except for:
         * 1. /api routes
         * 2. /_next (Next.js internals)
         * 3. /_static (inside /public)
         * 4. all root files inside /public (e.g. /favicon.ico)
         */
        "/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)",
    ],
};

export default function middleware(req: NextRequest) {
    const url = req.nextUrl;

    // Get hostname (e.g. "studio.opentunes.ai" or "localhost:7865")
    let hostname = req.headers.get("host") || "";

    // Handle Vercel Preview URLs (optional, treat as main domain)
    if (
        hostname.includes("vercel.app")
    ) {
        // Keep default routing for previews
    }

    // ALLOW LOCALHOST to function normally
    if (hostname.includes("localhost")) {
        return NextResponse.next();
    }

    // -----------------------------------------------------------------
    // ROUTE: studio.opentunes.ai
    // -----------------------------------------------------------------
    // Map root path "/" to "/studio"
    // Map "/xyz" to "/studio/xyz"
    if (hostname.startsWith("studio.")) {
        const searchParams = req.nextUrl.searchParams.toString();
        const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""
            }`;

        // Rewrite everything to be inside /studio
        return NextResponse.rewrite(
            new URL(`/studio${path === "/" ? "" : path}`, req.url)
        );
    }

    // -----------------------------------------------------------------
    // ROUTE: opentunes.ai (Main Domain)
    // -----------------------------------------------------------------
    // Users accessing the Landing Page.

    // Redirect explicit /studio access to the subdomain for consistency
    if (url.pathname === "/studio") {
        return NextResponse.redirect(new URL("https://studio.opentunes.ai", req.url));
    }

    return NextResponse.next();
}
