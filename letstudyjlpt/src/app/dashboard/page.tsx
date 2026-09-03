import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export default async function DashboardPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: attempts }] = await Promise.all([
    supabase.from("profiles").select("full_name, is_premium").eq("id", user.id).maybeSingle(),
    supabase.from("attempts").select("id, score, total_points, percentage, status, started_at").eq("user_id", user.id).order("started_at", { ascending: false }).limit(5),
  ]);
  const completed = attempts?.filter((attempt) => attempt.status === "completed") ?? [];
  const percentages = completed.map((attempt) => Number(attempt.percentage ?? 0));
  const average = percentages.length ? Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length) : 0;
  const best = percentages.length ? Math.max(...percentages) : 0;
  const displayName = profile?.full_name || user.user_metadata?.full_name || user.email?.split("@")[0] || "Learner";

  return <div className="mx-auto max-w-6xl px-5 py-12"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--red)]">Your workspace</p><h1 className="mt-3 text-4xl font-semibold tracking-tight">Welcome, {displayName}.</h1><p className="mt-3 text-[var(--ink-muted)]">A little practice today adds up quickly.</p></div><span className="w-fit rounded-full bg-[var(--mint)] px-4 py-2 text-sm font-semibold text-[#317052]">{profile?.is_premium ? "PREMIUM PLAN" : "FREE PLAN"}</span></div><div className="mt-10 grid gap-4 sm:grid-cols-3">{[[String(completed.length).padStart(2, "0"), "Tests completed"], [`${average}%`, "Average score"], [`${best}%`, "Best score"]].map(([value, label]) => <div key={label} className="border border-[var(--line)] bg-white p-6"><p className="text-3xl font-semibold">{value}</p><p className="mt-2 text-sm text-[var(--ink-muted)]">{label}</p></div>)}</div><div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]"><section><div className="flex items-center justify-between"><h2 className="text-xl font-semibold">Recent attempts</h2><Link href="/tests" className="text-sm font-medium text-[var(--red)]">Practice more →</Link></div><div className="mt-4 divide-y divide-[var(--line)] border-y border-[var(--line)] bg-white">{completed.length ? completed.map((attempt) => <div key={attempt.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-5"><div><p className="font-medium">Simulation #{attempt.id}</p><p className="mt-1 text-xs text-[var(--ink-muted)]">{new Date(attempt.started_at).toLocaleDateString()}</p></div><div className="flex items-center gap-5"><span className="font-semibold">{Number(attempt.percentage ?? 0)}%</span><span className="text-xs font-semibold text-[#317052]">{Number(attempt.percentage ?? 0) >= 60 ? "PASS" : "REVIEW"}</span><Link href={`/results/${attempt.id}`} className="text-sm text-[var(--ink-muted)]">View</Link></div></div>) : <div className="px-5 py-8 text-sm text-[var(--ink-muted)]">No completed simulations yet. Your first result will appear here.</div>}</div></section><aside className="border border-[var(--foreground)] bg-[var(--foreground)] p-6 text-white"><p className="text-sm font-semibold text-[#f4d8a0]">READY FOR MORE?</p><h2 className="mt-4 text-2xl font-semibold">Keep building your N5 rhythm.</h2><p className="mt-3 text-sm leading-6 text-[#c9d4cd]">Choose a practice set and make today’s session count.</p><Link href="/tests" className="mt-7 inline-block rounded-full bg-[#f4d8a0] px-5 py-3 text-sm font-semibold text-[#453316]">Browse tests</Link></aside></div></div>;
}
