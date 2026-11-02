import { NextResponse } from "next/server";
import {
  configuredPassword,
  cookieMaxAgeSeconds,
  passwordMatches,
  UNLOCK_COOKIE,
  unlockToken,
} from "@/lib/gate";

export const runtime = "nodejs";

/** POST { password } → sets the unlock cookie. Wrong password: small delay + 401. */
export async function POST(req: Request) {
  const password = configuredPassword();
  if (!password)
    return NextResponse.json(
      { ok: false, error: "not-configured" },
      { status: 503 },
    );
  let candidate = "";
  try {
    const body = (await req.json()) as { password?: unknown };
    candidate = typeof body.password === "string" ? body.password.trim() : "";
  } catch {
    candidate = "";
  }
  if (!passwordMatches(candidate, password)) {
    await new Promise((r) => setTimeout(r, 700));
    return NextResponse.json(
      { ok: false, error: "wrong-password" },
      { status: 401 },
    );
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set({
    name: UNLOCK_COOKIE,
    value: unlockToken(password),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: cookieMaxAgeSeconds(),
  });
  return res;
}

/** DELETE → locks this browser again (used by the "lock" link in the footer of the gate). */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set({ name: UNLOCK_COOKIE, value: "", path: "/", maxAge: 0 });
  return res;
}
