export const QUESTION_SECTIONS = ["Vocabulary", "Grammar", "Reading", "Listening"] as const;

export type ImportChoice = {
  key: string;
  text: string;
  is_correct: boolean;
};

export type ImportQuestion = {
  number: number;
  section: (typeof QUESTION_SECTIONS)[number];
  question_text: string;
  question_type?: "multiple_choice" | "reading" | "listening" | "image_question";
  choices: ImportChoice[];
  explanation?: string;
  points?: number;
  image_url?: string;
  audio_url?: string;
};

export type QuestionImport = {
  test: {
    title: string;
    description?: string;
    level?: string;
    duration_minutes: number;
    is_premium?: boolean;
    is_active?: boolean;
  };
  questions: ImportQuestion[];
};

export function validateQuestionImport(data: QuestionImport) {
  if (!data.test?.title?.trim()) throw new Error("test.title is required.");
  if (!Number.isInteger(data.test.duration_minutes) || data.test.duration_minutes <= 0) {
    throw new Error("test.duration_minutes must be a positive integer.");
  }
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    throw new Error("At least one question is required.");
  }

  const numbers = new Set<number>();
  data.questions.forEach((question, index) => {
    const label = `Question ${index + 1}`;
    if (!Number.isInteger(question.number) || question.number <= 0 || numbers.has(question.number)) {
      throw new Error(`${label}: number must be a unique positive integer.`);
    }
    numbers.add(question.number);
    if (!QUESTION_SECTIONS.includes(question.section)) throw new Error(`${label}: invalid section.`);
    if (!question.question_text?.trim()) throw new Error(`${label}: question_text is required.`);
    if (!Array.isArray(question.choices) || question.choices.length < 2) {
      throw new Error(`${label}: add at least two choices.`);
    }
    if (question.choices.filter((choice) => choice.is_correct).length !== 1) {
      throw new Error(`${label}: exactly one choice must have is_correct: true.`);
    }
    if (question.choices.some((choice) => !choice.key?.trim() || !choice.text?.trim())) {
      throw new Error(`${label}: every choice needs key and text.`);
    }
  });
}
