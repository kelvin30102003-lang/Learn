import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function SettingsPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <div className="max-w-3xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--red)]">Preferences</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Settings</h1><p className="mt-3 text-[var(--ink-muted)]">Manage your account and study preferences.</p><section className="mt-8 border border-[var(--line)] bg-white p-6"><h2 className="font-semibold">Account</h2><div className="mt-5 grid gap-4 sm:grid-cols-2"><div><p className="text-xs uppercase tracking-widest text-[var(--ink-muted)]">Email</p><p className="mt-2 text-sm">{user.email}</p></div><div><p className="text-xs uppercase tracking-widest text-[var(--ink-muted)]">Sign-in method</p><p className="mt-2 text-sm">Email and password</p></div></div></section></div>;
}
