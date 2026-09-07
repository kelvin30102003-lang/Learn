import TestCard from "@/components/TestCard";
import { adminClient, getCustomUser } from "@/lib/custom-auth";
import { redirect } from "next/navigation";
import { isJlptLevel } from "@/lib/jlpt-level";

export default async function TestsPage() {
  const user = await getCustomUser(); if (!user) redirect("/login");
  const level = isJlptLevel(user.target_level) ? user.target_level : "N5";
  const { data: tests } = await adminClient().from("tests").select("id, title, description, duration_minutes, is_premium").eq("is_active", true).eq("level", level).order("created_at", { ascending: false });
  return <div className="mx-auto max-w-6xl px-5 py-14"><div className="max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--red)]">Practice library</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Choose your next session.</h1><p className="mt-4 leading-7 text-[var(--ink-muted)]">Available {level} tests are loaded from your practice library.</p></div><div className="mt-10 grid gap-5 md:grid-cols-3">{tests?.length ? tests.map((test) => <TestCard key={test.id} test={{ id: test.id, title: test.title, description: test.description, durationMinutes: test.duration_minutes, isPremium: test.is_premium }} />) : <p className="text-[var(--ink-muted)]">No active {level} tests are available yet.</p>}</div></div>;
}
