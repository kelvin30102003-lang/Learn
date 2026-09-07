import { notFound, redirect } from "next/navigation";
import SimulationClient from "@/components/SimulationClient";
import { adminClient, getCustomUser } from "@/lib/custom-auth";
import type { Question, QuestionType, Section } from "@/types/question";

export default async function SimulationPage({ params }: { params: Promise<{ testId: string }> }) {
  const user = await getCustomUser();
  if (!user) redirect("/login");
  const { testId } = await params;
  const id = Number(testId);
  if (!Number.isSafeInteger(id) || id < 1) notFound();
  const client = adminClient();
  const { data: test } = await client.from("tests").select("id, title, duration_minutes, is_active, is_premium").eq("id", id).maybeSingle();
  if (!test?.is_active || (test.is_premium && !user.is_premium)) notFound();
  const { data, error } = await client.from("questions").select("id, section, question_number, question_text, question_type, explanation, audio_url, points, choices(id, choice_key, choice_text)").eq("test_id", test.id).order("question_number");
  if (error || !data?.length) notFound();
  const questions: Question[] = data.map((question) => ({ id: String(question.id), section: question.section as Section, questionNumber: question.question_number ?? 0, questionText: question.question_text ?? "", questionType: question.question_type as QuestionType, choices: (question.choices ?? []).map((choice) => ({ id: String(choice.id), key: choice.choice_key, text: choice.choice_text })), correctChoiceId: "", explanation: question.explanation ?? "", audioUrl: question.audio_url ?? undefined, points: question.points }));
  return <SimulationClient testId={String(test.id)} title={test.title} durationMinutes={test.duration_minutes} questions={questions} />;
}
