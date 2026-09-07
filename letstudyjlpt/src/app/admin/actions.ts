"use server";

import { revalidatePath } from "next/cache";
import { adminClient, getCustomUser } from "@/lib/custom-auth";

async function requireAdmin() {
  const user = await getCustomUser();
  if (!user || user.role !== "admin") throw new Error("Administrator access is required.");
  return user;
}

const text = (formData: FormData, name: string) => String(formData.get(name) ?? "").trim();
const number = (formData: FormData, name: string, fallback?: number) => { const value = Number(text(formData, name)); if (!Number.isFinite(value)) { if (fallback !== undefined) return fallback; throw new Error(`${name} must be a number.`); } return value; };

export async function createQuestion(formData: FormData) {
  await requireAdmin(); const client = adminClient();
  const questionText = text(formData, "question_text"); const section = text(formData, "section");
  if (!questionText || !["Vocabulary", "Grammar", "Reading", "Listening"].includes(section)) throw new Error("Question text and a valid section are required.");
  const testIdText = text(formData, "test_id"); const testId = testIdText ? number(formData, "test_id") : null;
  const { data: question, error } = await client.from("questions").insert({ test_id: testId, section, level: text(formData, "level") || "N5", question_number: number(formData, "question_number", 1), question_text: questionText, question_type: text(formData, "question_type") || "multiple_choice", explanation: text(formData, "explanation") || null, points: number(formData, "points", 1), is_active: true }).select("id").single();
  if (error || !question) throw new Error(error?.message ?? "Unable to create question.");
  const choices = ["A", "B", "C", "D"].map((key) => ({ question_id: question.id, choice_key: key, choice_text: text(formData, `choice_${key}`), is_correct: text(formData, "correct_choice") === key })).filter((choice) => choice.choice_text);
  if (choices.length < 2 || choices.filter((choice) => choice.is_correct).length !== 1) { await client.from("questions").delete().eq("id", question.id); throw new Error("Add at least two choices and select one correct answer."); }
  const { error: choiceError } = await client.from("choices").insert(choices); if (choiceError) throw new Error("Question created, but choices could not be saved.");
  revalidatePath("/admin/questions"); revalidatePath("/admin");
}

export async function updateQuestion(formData: FormData) {
  await requireAdmin(); const id = number(formData, "id"); const client = adminClient();
  const { error } = await client.from("questions").update({ section: text(formData, "section"), level: text(formData, "level") || "N5", question_number: number(formData, "question_number", 1), question_text: text(formData, "question_text"), question_type: text(formData, "question_type") || "multiple_choice", explanation: text(formData, "explanation") || null, points: number(formData, "points", 1) }).eq("id", id);
  if (error) throw new Error("Unable to update question."); revalidatePath("/admin/questions"); revalidatePath("/admin");
}

export async function deleteQuestion(formData: FormData) {
  await requireAdmin(); const id = number(formData, "id"); const { error } = await adminClient().from("questions").delete().eq("id", id); if (error) throw new Error("Unable to delete question."); revalidatePath("/admin/questions"); revalidatePath("/admin");
}

export async function createTest(formData: FormData) {
  await requireAdmin(); const title = text(formData, "title"); const duration = number(formData, "duration_minutes"); if (!title || duration < 1) throw new Error("A title and positive duration are required.");
  const { error } = await adminClient().from("tests").insert({ title, description: text(formData, "description") || null, level: text(formData, "level") || "N5", duration_minutes: duration, is_premium: formData.get("is_premium") === "on", is_active: false }); if (error) throw new Error("Unable to create test."); revalidatePath("/admin/tests"); revalidatePath("/admin"); revalidatePath("/tests");
}

export async function toggleTestActive(formData: FormData) {
  await requireAdmin(); const id = number(formData, "id"); const active = text(formData, "active") === "true"; const { error } = await adminClient().from("tests").update({ is_active: !active }).eq("id", id); if (error) throw new Error("Unable to update test."); revalidatePath("/admin/tests"); revalidatePath("/admin"); revalidatePath("/tests");
}
