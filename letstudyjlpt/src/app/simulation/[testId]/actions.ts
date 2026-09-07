"use server";

import { revalidatePath } from "next/cache";
import { adminClient, getCustomUser } from "@/lib/custom-auth";

type SelectedAnswers = Record<string, string>;

function asPositiveInteger(value: string) {
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) throw new Error("Invalid exam identifier.");
  return number;
}

export async function startExamAttempt(testId: string) {
  const user = await getCustomUser();
  if (!user) throw new Error("You must be signed in to start an exam.");
  const numericTestId = asPositiveInteger(testId);
  const client = adminClient();
  const [{ data: test }, { data: questions }] = await Promise.all([
    client.from("tests").select("id, is_active").eq("id", numericTestId).maybeSingle(),
    client.from("questions").select("points").eq("test_id", numericTestId),
  ]);
  if (!test?.is_active) throw new Error("This exam is not available.");
  if (!questions?.length) throw new Error("This exam has no questions.");

  const { data: existing } = await client.from("attempts").select("id").eq("user_id", user.id).eq("test_id", numericTestId).eq("status", "in_progress").order("started_at", { ascending: false }).limit(1).maybeSingle();
  if (existing) return { attemptId: String(existing.id) };

  const totalPoints = questions.reduce((total, question) => total + Math.max(0, Number(question.points ?? 0)), 0);
  const { data: attempt, error } = await client.from("attempts").insert({ user_id: user.id, test_id: numericTestId, status: "in_progress", score: 0, total_points: totalPoints }).select("id").single();
  if (error || !attempt) throw new Error("Unable to start the exam.");
  return { attemptId: String(attempt.id) };
}

export async function submitExamAttempt(attemptId: string, selectedAnswers: SelectedAnswers) {
  const user = await getCustomUser();
  if (!user) throw new Error("You must be signed in to submit an exam.");
  const numericAttemptId = asPositiveInteger(attemptId);
  const client = adminClient();
  const { data: attempt, error: attemptError } = await client.from("attempts").select("id, test_id, status").eq("id", numericAttemptId).eq("user_id", user.id).maybeSingle();
  if (attemptError || !attempt) throw new Error("Exam attempt not found.");
  if (attempt.status === "completed") return { attemptId: String(attempt.id) };
  if (attempt.status !== "in_progress" || !attempt.test_id) throw new Error("This exam cannot be submitted.");

  const { data: questions, error: questionError } = await client.from("questions").select("id, points, choices(id, is_correct)").eq("test_id", attempt.test_id);
  if (questionError || !questions?.length) throw new Error("Unable to evaluate this exam.");

  const answerRows: { attempt_id: number; question_id: number; choice_id: number; is_correct: boolean }[] = [];
  let score = 0;
  let totalPoints = 0;
  for (const question of questions) {
    const points = Math.max(0, Number(question.points ?? 0));
    totalPoints += points;
    const choiceId = selectedAnswers[String(question.id)];
    const selectedChoice = (question.choices ?? []).find((choice) => String(choice.id) === String(choiceId));
    if (!selectedChoice) continue;
    const correct = Boolean(selectedChoice.is_correct);
    if (correct) score += points;
    answerRows.push({ attempt_id: attempt.id, question_id: question.id, choice_id: selectedChoice.id, is_correct: correct });
  }

  if (answerRows.length) {
    const { error: clearError } = await client.from("user_answers").delete().eq("attempt_id", attempt.id);
    if (clearError) throw new Error("Unable to prepare exam answers.");
    const { error } = await client.from("user_answers").insert(answerRows);
    if (error) throw new Error("Unable to save exam answers.");
  }
  const percentage = totalPoints ? Math.round((score / totalPoints) * 10000) / 100 : 0;
  const { error: updateError } = await client.from("attempts").update({ status: "completed", score, total_points: totalPoints, percentage, completed_at: new Date().toISOString() }).eq("id", attempt.id).eq("status", "in_progress");
  if (updateError) throw new Error("Unable to complete the exam.");
  revalidatePath("/dashboard");
  revalidatePath(`/results/${attempt.id}`);
  revalidatePath(`/review/${attempt.id}`);
  return { attemptId: String(attempt.id) };
}
