import Link from "next/link";
import { getPublishedYearlyExams } from "@/lib/yearly-exams";
import { getCustomUser } from "@/lib/custom-auth";
import { isJlptLevel } from "@/lib/jlpt-level";

export default async function YearlyMockExamPage() {
  const user = await getCustomUser();
  const level = isJlptLevel(user?.target_level) ? user.target_level : "N5";
  const exams = await getPublishedYearlyExams(level);

  return <div className="mx-auto w-full max-w-5xl px-5 py-10 lg:py-16"><Link href="/mock-exam" className="text-sm font-semibold text-slate-500 hover:text-slate-900">← Choose another mode</Link><div className="mt-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--red)]">Yearly exam</p><h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">Choose an exam year.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">Only published N5 exams with an ordered question set appear here.</p></div>{exams.length ? <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">{exams.map((exam) => <Link key={exam.id} href={`/mock-exam/yearly/${exam.year}`} className="rounded-xl border border-slate-200 bg-white px-4 py-5 shadow-sm transition hover:border-[var(--red)] hover:bg-red-50"><strong className="block text-center text-lg font-bold text-slate-800">{exam.year}</strong><span className="mt-2 block text-center text-xs text-slate-500">{exam.questionCount} questions</span></Link>)}</div> : <div className="mt-10 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center"><h2 className="text-xl font-bold text-slate-900">No yearly exams published yet.</h2><p className="mt-2 text-sm text-slate-500">An administrator must publish a year and attach its ordered questions before it appears here.</p></div>}</div>;
}
