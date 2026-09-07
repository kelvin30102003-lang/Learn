import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { adminClient, getCustomUser } from "@/lib/custom-auth";

export default async function ReviewPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const user = await getCustomUser(); if (!user) redirect("/login");
  const { attemptId } = await params; const id = Number(attemptId); if (!Number.isSafeInteger(id) || id < 1) notFound();
  const client = adminClient();
  const { data: attempt } = await client.from("attempts").select("id, status, test_id").eq("id", id).eq("user_id", user.id).maybeSingle();
  if (!attempt || attempt.status !== "completed" || !attempt.test_id) notFound();
  const [{ data: questions }, { data: savedAnswers }] = await Promise.all([
    client.from("questions").select("id, section, question_number, question_text, explanation, choices(id, choice_key, choice_text, is_correct)").eq("test_id", attempt.test_id).order("question_number"),
    client.from("user_answers").select("question_id, choice_id, is_correct").eq("attempt_id", attempt.id),
  ]);
  const answers = new Map((savedAnswers ?? []).map((answer) => [answer.question_id, answer]));
  return <div className="mx-auto max-w-4xl px-5 py-12"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--red)]">Answer review</p><h1 className="mt-3 text-4xl font-semibold">Learn from every question.</h1></div><Link href={`/results/${attempt.id}`} className="text-sm text-[var(--red)]">← Back to result</Link></div><div className="mt-10 space-y-4">{(questions ?? []).map((question, index) => { const answer = answers.get(question.id); const correct = (question.choices ?? []).find((choice) => choice.is_correct); const selected = (question.choices ?? []).find((choice) => choice.id === answer?.choice_id); return <article key={question.id} className="border border-[var(--line)] bg-white p-6"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-widest text-[var(--ink-muted)]">{question.section} · {index + 1}</p><span className={`rounded-full px-3 py-1 text-xs font-semibold ${answer?.is_correct ? "bg-[var(--mint)] text-[#317052]" : "bg-[#fff3f0] text-[var(--red)]"}`}>{answer?.is_correct ? "CORRECT" : answer ? "INCORRECT" : "UNANSWERED"}</span></div><h2 className="mt-5 text-lg font-medium leading-7">{question.question_text}</h2><div className="mt-5 grid gap-3 text-sm sm:grid-cols-2"><div className="border border-[#b8d4bf] bg-[var(--mint)] p-3"><span className="text-xs text-[#317052]">Correct answer</span><p className="mt-1 font-medium">{correct ? `${correct.choice_key}. ${correct.choice_text}` : "Not configured"}</p></div><div className="border border-[var(--line)] p-3"><span className="text-xs text-[var(--ink-muted)]">Your answer</span><p className="mt-1 font-medium">{selected ? `${selected.choice_key}. ${selected.choice_text}` : "No answer"}</p></div></div>{question.explanation && <p className="mt-5 border-t border-[var(--line)] pt-4 text-sm leading-6 text-[var(--ink-muted)]"><strong className="text-[var(--foreground)]">Why:</strong> {question.explanation}</p>}</article>; })}</div></div>;
}
