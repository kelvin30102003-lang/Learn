import { readFile } from "node:fs/promises";

const [, , importFile] = process.argv;
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!importFile) throw new Error("Usage: npm run import:questions -- data/imports/n5-mondai.json");
if (!url || !serviceRoleKey) throw new Error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.");

const { validateQuestionImport } = await import("../src/lib/question-import.ts");
const data = JSON.parse(await readFile(importFile, "utf8"));
validateQuestionImport(data);

async function request(path, method, body, prefer) {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: prefer,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!response.ok) throw new Error(`${method} ${path}: ${await response.text()}`);
  return response.status === 204 ? null : response.json();
}

const [test] = await request("tests", "POST", {
  title: data.test.title,
  description: data.test.description ?? null,
  level: data.test.level ?? "N5",
  duration_minutes: data.test.duration_minutes,
  is_premium: data.test.is_premium ?? false,
  is_active: data.test.is_active ?? false,
}, "return=representation");

for (const item of data.questions) {
  const [question] = await request("questions", "POST", {
    test_id: test.id,
    section: item.section,
    question_number: item.number,
    question_text: item.question_text,
    question_type: item.question_type ?? "multiple_choice",
    explanation: item.explanation ?? null,
    points: item.points ?? 1,
    image_url: item.image_url ?? null,
    audio_url: item.audio_url ?? null,
    level: data.test.level ?? "N5",
  }, "return=representation");
  await request("choices", "POST", item.choices.map((choice) => ({
    question_id: question.id,
    choice_key: choice.key,
    choice_text: choice.text,
    is_correct: choice.is_correct,
  })), "return=minimal");
}

console.log(`Imported ${data.questions.length} questions into test #${test.id}. It is ${test.is_active ? "active" : "inactive"}.`);
