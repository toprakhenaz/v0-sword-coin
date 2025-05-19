import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get cookies
  const userId = request.cookies.get("user_id")?.value
  const telegramId = request.cookies.get("telegram_id")?.value

  // Check if user is authenticated
  const isAuthenticated = userId && telegramId

  // Get the path
  const path = request.nextUrl.pathname

  // If user is not authenticated and trying to access protected routes
  if (!isAuthenticated && path !== "/login") {
    // Redirect to login page
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // If user is authenticated and trying to access login page
  if (isAuthenticated && path === "/login") {
    // Redirect to home page
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

// Only run middleware on specific paths
export const config = {
  matcher: ["/", "/mine", "/earn", "/friends", "/login"],
}
