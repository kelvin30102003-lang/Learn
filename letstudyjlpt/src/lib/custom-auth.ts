import { createHmac, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const cookieName = "kotoba_session";
const secret = process.env.CUSTOM_AUTH_SECRET;

type CustomUser = {
  id: string;
  full_name: string;
  email: string;
  role: string;
  is_premium: boolean;
  target_level: string | null;
};

function adminClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

function sign(value: string) {
  if (!secret) throw new Error("CUSTOM_AUTH_SECRET is not configured");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function createSession(userId: string) {
  const value = `${userId}.${randomBytes(24).toString("hex")}`;
  return `${value}.${sign(value)}`;
}

export function verifySession(value: string | undefined) {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const payload = `${parts[0]}.${parts[1]}`;
  return sign(payload) === parts[2] ? parts[0] : null;
}

export async function getCustomUser() {
  const session = (await cookies()).get(cookieName)?.value;
  const userId = verifySession(session);
  if (!userId) return null;

  // `target_level` was added after the initial custom-users migration.  Do
  // not turn a valid session into a logout when an existing deployment has
  // not applied that optional migration yet.
  const client = adminClient();
  const detailed = await client
    .from("users")
    .select("id, full_name, email, role, is_premium, target_level")
    .eq("id", userId)
    .maybeSingle();

  if (!detailed.error) return detailed.data as CustomUser | null;

  const basic = await client
    .from("users")
    .select("id, full_name, email, role, is_premium")
    .eq("id", userId)
    .maybeSingle();
  return basic.data ? { ...basic.data, target_level: null } as CustomUser : null;
}

export { adminClient, cookieName };
