
// import {
//   NextResponse,
// } from "next/server";

// import type {
//   NextRequest,
// } from "next/server";

// export function middleware(
//   request: NextRequest,
// ) {
//   const token =
//     request.cookies.get(
//       "token",
//     )?.value;

//   const pathname =
//     request.nextUrl.pathname;

//   if (
//     !token &&
//     pathname !== "/login" &&
//     !pathname.startsWith(
//       "/verify",
//     )
//   ) {
//     return NextResponse.redirect(
//       new URL(
//         "/login",
//         request.url,
//       ),
//     );
//   }

//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/admin/:path*",
//     "/user/:path*",
//   ],
// };
import {
  NextResponse,
} from "next/server";

import type {
  NextRequest,
} from "next/server";

export function middleware(
  request: NextRequest,
) {
  const token =
    request.cookies.get(
      "token",
    )?.value;

  const role =
    request.cookies.get(
      "role",
    )?.value;

  const pathname =
    request.nextUrl.pathname;

  // ❌ chưa login
  if (
    !token &&
    pathname !== "/login" &&
    !pathname.startsWith(
      "/verify",
    )
  ) {
    return NextResponse.redirect(
      new URL(
        "/login",
        request.url,
      ),
    );
  }

  // ❌ USER vào admin
  if (
    pathname.startsWith(
      "/admin",
    ) &&
    role !== "ADMIN" &&
    role !== "OWNER"
  ) {
    return NextResponse.redirect(
      new URL(
        "/user",
        request.url,
      ),
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/user/:path*",
  ],
};