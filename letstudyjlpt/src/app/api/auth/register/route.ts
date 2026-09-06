import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { adminClient, cookieName, createSession } from "@/lib/custom-auth";

export async function POST(request: Request) {
  try {
    const { fullName, email, password } = await request.json();
    if (!fullName || !email || !password || password.length < 8) return NextResponse.json({ error: "Name, email, and an 8-character password are required." }, { status: 400 });
    const normalizedEmail = String(email).trim().toLowerCase();
    const client = adminClient();
    const { data: existing } = await client.from("users").select("id").eq("email", normalizedEmail).maybeSingle();
    if (existing) return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    const { data: user, error } = await client.from("users").insert({ full_name: String(fullName).trim(), email: normalizedEmail, password_hash: await bcrypt.hash(password, 12) }).select("id").single();
    if (error || !user) return NextResponse.json({ error: error?.message ?? "Unable to create account." }, { status: 500 });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(cookieName, createSession(user.id), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return response;
  } catch (error) {
    const message = error instanceof Error && error.message.includes("not configured") ? error.message : "Unable to create account.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
