import { adminClient } from "@/lib/custom-auth";
import type { JlptLevel } from "@/lib/jlpt-level";

export type YearlyExamSummary = {
  id: number;
  year: number;
  title: string;
  questionCount: number;
};

export async function getPublishedYearlyExams(level: JlptLevel): Promise<YearlyExamSummary[]> {
  const client = adminClient();
  const { data, error } = await client
    .from("yearly_exams")
    .select("id, year, title, yearly_exam_questions(id)")
    .eq("level", level)
    .eq("is_published", true)
    .order("year", { ascending: true });

  if (error) return [];
  return (data ?? []).map((exam) => ({
    id: exam.id,
    year: exam.year,
    title: exam.title,
    questionCount: Array.isArray(exam.yearly_exam_questions) ? exam.yearly_exam_questions.length : 0,
  }));
}

export async function getPublishedYearlyExam(level: JlptLevel, year: number) {
  const client = adminClient();
  const { data: exam, error } = await client
    .from("yearly_exams")
    .select("id, year, title, level, yearly_exam_questions(question_id, section_order, question_order, questions(id, section, section_type, question_type, question_number, question_text, explanation, audio_url, image_url, points, choices(id, choice_key, choice_text)))")
    .eq("level", level)
    .eq("year", year)
    .eq("is_published", true)
    .maybeSingle();

  if (error || !exam) return null;
  const questions = [...(exam.yearly_exam_questions ?? [])].sort((left, right) => left.question_order - right.question_order);
  return { ...exam, yearly_exam_questions: questions };
}
