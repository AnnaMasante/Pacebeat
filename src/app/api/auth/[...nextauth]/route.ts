import { NextRequest } from "next/server";
import { handlers } from "@/infrastructure/auth/authOptions";

function logRequest(label: string, req: NextRequest) {
  console.log(`[route-debug] ${label}`, {
    url: req.url,
    hostHeader: req.headers.get("host"),
    forwardedHost: req.headers.get("x-forwarded-host"),
    forwardedProto: req.headers.get("x-forwarded-proto"),
    nextUrlOrigin: req.nextUrl.origin,
    cookieNames: req.headers
      .get("cookie")
      ?.split(";")
      .map((c) => c.trim().split("=")[0]),
  });
}

export async function GET(req: NextRequest) {
  logRequest("GET", req);
  return handlers.GET(req);
}

export async function POST(req: NextRequest) {
  logRequest("POST", req);
  return handlers.POST(req);
}
