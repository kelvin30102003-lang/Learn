import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import SimulationClient from "@/components/SimulationClient";
import { getQuestions, getTest } from "@/data/mock";
import { createClient } from "@/utils/supabase/server";
import type { Question, QuestionType, Section } from "@/types/question";

export default async function SimulationPage({ params }: { params: Promise<{ testId: string }> }) {
  const { testId } = await params;
  const supabase = createClient(await cookies());
  const { data: databaseTest } = await supabase
    .from("tests")
    .select("id, question_count:questions(count)")
    .eq("id", testId)
    .maybeSingle();

  if (databaseTest) {
    const { data, error } = await supabase
      .from("questions")
      .select("id, section, question_number, question_text, question_type, explanation, audio_url, points, choices(id, choice_key, choice_text)")
      .eq("test_id", databaseTest.id)
      .order("question_number");
    if (error || !data?.length) notFound();

    const questions: Question[] = data.map((question) => ({
      id: String(question.id),
      section: question.section as Section,
      questionNumber: question.question_number ?? 0,
      questionText: question.question_text ?? "",
      questionType: question.question_type as QuestionType,
      choices: (question.choices ?? []).map((choice) => ({
        id: String(choice.id),
        key: choice.choice_key,
        text: choice.choice_text,
      })),
      // The correct answer is deliberately not sent to the exam browser.
      correctChoiceId: "",
      explanation: question.explanation ?? "",
      audioUrl: question.audio_url ?? undefined,
      points: question.points,
    }));
    return <SimulationClient questions={questions} />;
  }

  // Keep existing demo routes working until their data is imported.
  const test = getTest(testId);
  if (!test) notFound();
  return <SimulationClient questions={getQuestions(testId).slice(0, test.questionCount)} />;
}
