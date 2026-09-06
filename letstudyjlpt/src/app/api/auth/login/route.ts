import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminClient, cookieName, createSession } from "@/lib/custom-auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const normalizedEmail = String(email ?? "").trim().toLowerCase();
    const { data: user } = await adminClient().from("users").select("id, password_hash").eq("email", normalizedEmail).maybeSingle();
    if (!user || !(await bcrypt.compare(String(password ?? ""), user.password_hash))) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieName, createSession(user.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch (error) {
    const message = error instanceof Error && error.message.includes("not configured") ? error.message : "Unable to log in.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
