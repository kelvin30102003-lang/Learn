"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import SectionBadge from "@/components/SectionBadge";
import type { Question } from "@/types/question";
import { startExamAttempt, submitExamAttempt } from "@/app/simulation/[testId]/actions";

type Props = { testId: string; title: string; durationMinutes: number; questions: Question[] };

export default function SimulationClient({ testId, title, durationMinutes, questions }: Props) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(Math.max(1, durationMinutes) * 60);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const submitted = useRef(false);
  const question = questions[current];

  useEffect(() => {
    let cancelled = false;
    startExamAttempt(testId).then((result) => { if (!cancelled) setAttemptId(result.attemptId); }).catch((reason) => { if (!cancelled) setError(reason instanceof Error ? reason.message : "Unable to start the exam."); });
    return () => { cancelled = true; };
  }, [testId]);

  const submit = useCallback(() => {
    if (!attemptId || submitted.current) return;
    submitted.current = true;
    setError("");
    startTransition(async () => {
      try {
        const result = await submitExamAttempt(attemptId, answers);
        router.replace(`/results/${result.attemptId}`);
      } catch (reason) {
        submitted.current = false;
        setError(reason instanceof Error ? reason.message : "Unable to submit the exam.");
      }
    });
  }, [answers, attemptId, router]);

  useEffect(() => {
    if (!attemptId || isPending || error) return;
    if (seconds <= 0) { submit(); return; }
    const timer = window.setTimeout(() => setSeconds((value) => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [attemptId, seconds, isPending, error, submit]);

  if (!question) return <div className="mx-auto max-w-xl px-5 py-16"><p>No questions are available for this exam.</p></div>;
  const minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
  const remaining = String(seconds % 60).padStart(2, "0");
  const locked = !attemptId || isPending;

  return <div className="mx-auto max-w-6xl px-5 py-8"><div className="mb-7 flex flex-wrap items-center justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--red)]">JLPT simulation</p><h1 className="mt-2 text-2xl font-semibold">{title}</h1></div><div className="border border-[var(--line)] bg-white px-5 py-3 text-right"><p className="text-xs uppercase tracking-widest text-[var(--ink-muted)]">Time left</p><p className="font-mono text-2xl font-semibold text-[var(--red)]">{minutes}:{remaining}</p></div></div>{error && <p role="alert" className="mb-5 border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p>}<div className="grid gap-6 lg:grid-cols-[1fr_280px]"><section className="border border-[var(--line)] bg-white p-6 sm:p-10"><div className="flex items-center justify-between"><SectionBadge section={question.section} /><span className="text-sm text-[var(--ink-muted)]">Question {current + 1} / {questions.length}</span></div><h2 className="mt-10 text-2xl font-medium leading-relaxed sm:text-3xl">{question.questionText}</h2>{question.questionType === "listening" && question.audioUrl && <audio className="mt-7 w-full" controls src={question.audioUrl}>Your browser does not support audio.</audio>}<div className="mt-9 grid gap-3">{question.choices.map((choice) => <button key={choice.id} disabled={locked} onClick={() => setAnswers((previous) => ({ ...previous, [question.id]: choice.id }))} className={`flex items-center gap-4 border px-4 py-4 text-left transition disabled:cursor-not-allowed disabled:opacity-60 ${answers[question.id] === choice.id ? "border-[var(--red)] bg-[#fff3f0]" : "border-[var(--line)] hover:border-[#aebeb1]"}`}><span className={`grid size-8 place-items-center rounded-full border text-sm ${answers[question.id] === choice.id ? "border-[var(--red)] bg-[var(--red)] text-white" : "border-[var(--line)]"}`}>{choice.key}</span>{choice.text}</button>)}</div><div className="mt-10 flex justify-between gap-3 border-t border-[var(--line)] pt-6"><button disabled={current === 0 || locked} onClick={() => setCurrent((value) => value - 1)} className="rounded-full border border-[var(--line)] px-5 py-2 text-sm disabled:opacity-40">← Previous</button>{current === questions.length - 1 ? <button disabled={locked} onClick={submit} className="rounded-full bg-[var(--red)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60">{isPending ? "Submitting…" : "Submit test"}</button> : <button disabled={locked} onClick={() => setCurrent((value) => value + 1)} className="rounded-full bg-[var(--foreground)] px-5 py-2 text-sm font-medium text-white disabled:opacity-60">Next →</button>}</div></section><aside className="h-fit border border-[var(--line)] bg-white p-5"><h2 className="font-semibold">Question map</h2><p className="mt-1 text-sm text-[var(--ink-muted)]">{Object.keys(answers).length} answered · {questions.length - Object.keys(answers).length} left</p><div className="mt-5 grid grid-cols-5 gap-2">{questions.map((item, index) => <button key={item.id} disabled={locked} onClick={() => setCurrent(index)} className={`aspect-square border text-sm disabled:opacity-60 ${index === current ? "border-[var(--red)] bg-[var(--red)] text-white" : answers[item.id] ? "border-[#b8d4bf] bg-[var(--mint)] text-[#317052]" : "border-[var(--line)]"}`}>{index + 1}</button>)}</div></aside></div></div>;
}
