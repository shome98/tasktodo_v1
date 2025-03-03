import { clerkClient, clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const publicRoutes = ["/", "/api/webhooks/register", "/sign-in", "/sign-up"];
const adminRoutes = ["/admin/dashboard", "/admin/users"];
type UserRole = "admin" | "user";

async function fetchUserRole(userId: string): Promise<UserRole | undefined> {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.publicMetadata.role as UserRole | undefined;
  } catch (error) {
    console.error("Error fetching user role from Clerk:", error);
    return undefined;
  }
}

function handleRoleBasedRedirect(
  role: UserRole | undefined,
  pathname: string,
  url: URL |string
): NextResponse | undefined {
 
  if (role === "admin" && pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/admin/dashboard", url));
  }
  if (role !== "admin" && adminRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", url));
  }
  if (publicRoutes.includes(pathname)) {
    return NextResponse.redirect(
      new URL(role === "admin" ? "/admin/dashboard" : "/dashboard", url)
    );
  }
  return undefined;
}

const isPublicRoute = createRouteMatcher(publicRoutes);

export default clerkMiddleware(async (auth, req) => {
  const {userId} = await auth();
  if (!userId && !isPublicRoute(req)) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }
  if (userId) {
    const role = await fetchUserRole(userId);
    const redirectResponse = handleRoleBasedRedirect(role, req.nextUrl.pathname, req.url);
    if (redirectResponse) {
      return redirectResponse;
    }
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};