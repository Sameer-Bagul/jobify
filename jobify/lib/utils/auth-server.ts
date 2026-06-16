import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { env } from "./env";

export interface AuthPayload {
  userId: string;
  role: string;
}

export function getAuthUser(req: NextRequest): AuthPayload | null {
  const authHeader = req.headers.get("authorization");
  let token = req.cookies.get("token")?.value;

  if (!token && authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1];
  }

  if (!token) {
    return null;
  }

  try {
    return jwt.verify(token, env.jwtSecret) as AuthPayload;
  } catch (error) {
    return null;
  }
}

export function requireAuth(req: NextRequest) {
  const user = getAuthUser(req);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export function requireRole(req: NextRequest, role: string) {
  const user = requireAuth(req);
  if (user.role !== role) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export function handleAuthError(error: any) {
  if (error.message === "UNAUTHORIZED") {
    return NextResponse.json({ error: "Access token required or invalid" }, { status: 401 });
  }
  if (error.message === "FORBIDDEN") {
    return NextResponse.json({ error: "Access denied. Insufficient role." }, { status: 403 });
  }
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}
