import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { adminClient, getCustomUser } from "@/lib/custom-auth";

export default async function ResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const user = await getCustomUser(); if (!user) redirect("/login");
  const { attemptId } = await params; const id = Number(attemptId); if (!Number.isSafeInteger(id) || id < 1) notFound();
  const client = adminClient();
  const { data: attempt } = await client.from("attempts").select("id, score, total_points, percentage, status, started_at, completed_at, tests(title), user_answers(is_correct, questions(section, points))").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!attempt || attempt.status !== "completed") notFound();
  const sections = new Map<string, { score: number; total: number }>();
  for (const answer of attempt.user_answers ?? []) { const question = Array.isArray(answer.questions) ? answer.questions[0] : answer.questions; if (!question) continue; const section = question.section ?? "Other"; const current = sections.get(section) ?? { score: 0, total: 0 }; current.total += Number(question.points ?? 0); if (answer.is_correct) current.score += Number(question.points ?? 0); sections.set(section, current); }
  const percentage = Number(attempt.percentage ?? (attempt.total_points ? attempt.score / attempt.total_points * 100 : 0));
  const testRelation = attempt.tests as unknown as { title: string } | { title: string }[] | null;
  const title = Array.isArray(testRelation) ? testRelation[0]?.title : testRelation?.title;
  return <div className="mx-auto max-w-4xl px-5 py-14"><div className="border-b border-[var(--line)] pb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--red)]">Simulation complete</p><div className="mt-4 flex flex-wrap items-end justify-between gap-5"><div><h1 className="text-4xl font-semibold tracking-tight">{title ?? "Practice result"}</h1><p className="mt-3 text-[var(--ink-muted)]">Completed {attempt.completed_at ? new Date(attempt.completed_at).toLocaleString() : "just now"}.</p></div><div className="text-left sm:text-right"><p className="text-5xl font-semibold text-[var(--red)]">{percentage.toFixed(0)}%</p><p className="mt-1 text-sm font-semibold text-[#317052]">{percentage >= 60 ? "PASS" : "KEEP PRACTICING"} · {attempt.score} / {attempt.total_points} POINTS</p></div></div></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{["Vocabulary", "Grammar", "Reading", "Listening"].map((section) => { const value = sections.get(section) ?? { score: 0, total: 0 }; return <div key={section} className="border border-[var(--line)] bg-white p-5"><p className="text-xl font-semibold">{value.score} / {value.total}</p><p className="mt-2 text-sm text-[var(--ink-muted)]">{section}</p></div>; })}</div><div className="mt-8 border border-[#ead6a8] bg-[var(--cream)] p-5 text-sm leading-6 text-[#6f572b]">This simulation score is for practice purposes and is not an official JLPT result.</div><div className="mt-8 flex flex-wrap gap-3"><Link href={`/review/${attempt.id}`} className="rounded-full bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-white">Review answers</Link><Link href="/tests" className="rounded-full border border-[var(--line)] bg-white px-5 py-3 text-sm font-medium">Try another test</Link></div></div>;
}
