import Link from "next/link";
import { getPublishedYearlyExam } from "@/lib/yearly-exams";
import { getCustomUser } from "@/lib/custom-auth";
import { isJlptLevel } from "@/lib/jlpt-level";

export default async function YearlyPreviewPage({ params }: { params: Promise<{ year: string }> }) {
  const { year: rawYear } = await params;
  const user = await getCustomUser();
  const level = isJlptLevel(user?.target_level) ? user.target_level : "N5";
  const year = Number(rawYear);
  const exam = Number.isInteger(year) && year >= 2007 && year <= 2024 ? await getPublishedYearlyExam(level, year) : null;
  const grouped = exam?.yearly_exam_questions.reduce<Record<string, number>>((result, item) => {
    const question = item.questions?.[0];
    const section = question?.section_type ?? question?.section ?? "Other";
    result[section] = (result[section] ?? 0) + 1;
    return result;
  }, {}) ?? {};

  return <div className="mx-auto w-full max-w-4xl px-5 py-10 lg:py-16"><Link href="/mock-exam/yearly" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Choose another year</Link><div className="mt-10 rounded-2xl border border-slate-200 bg-white p-7 shadow-sm lg:p-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--red)]">Yearly exam preview</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">{exam?.title ?? `JLPT N5 Exam ${rawYear}`}</h1>{exam ? <><p className="mt-3 text-lg text-slate-600">Year: <strong className="text-slate-900">{exam.year}</strong> · {exam.yearly_exam_questions.length} ordered questions</p><div className="mt-8 grid gap-4 sm:grid-cols-3">{Object.entries(grouped).map(([section, count]) => <div key={section} className="rounded-xl border border-slate-200 bg-slate-50 p-5"><strong className="block text-slate-900">{section}</strong><span className="mt-2 block text-sm text-slate-500">{count} questions</span></div>)}</div><div className="mt-8 flex items-center gap-4"><button type="button" disabled className="rounded-xl bg-[var(--red)] px-6 py-3 text-sm font-bold text-white opacity-60">Start exam</button><span className="text-sm text-slate-500">The shared exam engine will be connected next.</span></div></> : <div className="mt-8 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6"><h2 className="font-bold text-slate-900">This yearly exam is not available.</h2><p className="mt-2 text-sm text-slate-500">The year must be published and have ordered questions attached by an administrator.</p></div>}</div></div>;
}
