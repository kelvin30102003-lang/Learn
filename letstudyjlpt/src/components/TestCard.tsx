import Link from "next/link";

export type TestCardData = { id: number; title: string; description: string | null; durationMinutes: number; isPremium: boolean };

export default function TestCard({ test }: { test: TestCardData }) {
  return <article className="flex flex-col justify-between border border-[var(--line)] bg-white p-5 shadow-[0_6px_20px_rgba(23,32,29,0.04)] transition hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(23,32,29,0.08)]"><div><div className="mb-5 flex items-center justify-between"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${test.isPremium ? "bg-[var(--cream)] text-[#9a671f]" : "bg-[var(--mint)] text-[#317052]"}`}>{test.isPremium ? "PREMIUM" : "FREE"}</span><span className="text-xs text-[var(--ink-muted)]">{test.durationMinutes} min</span></div><h3 className="text-lg font-semibold">{test.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--ink-muted)]">{test.description ?? "Practice with an original JLPT-style question set."}</p></div><Link href={test.isPremium ? "/premium" : `/simulation/${test.id}`} className="mt-6 inline-flex items-center justify-center rounded-full border border-[var(--foreground)] px-4 py-2 text-sm font-medium transition hover:bg-[var(--foreground)] hover:text-white">{test.isPremium ? "Unlock test" : "Start practice"} <span className="ml-2">→</span></Link></article>;
}
