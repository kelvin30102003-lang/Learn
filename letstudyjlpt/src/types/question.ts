export type Section = "Vocabulary" | "Grammar" | "Reading" | "Listening";
export type QuestionType = "multiple_choice" | "reading" | "listening" | "image_question";

export type Choice = { id: string; key: string; text: string };

export type Question = {
  id: string;
  section: Section;
  questionNumber: number;
  questionText: string;
  questionType: QuestionType;
  choices: Choice[];
  correctChoiceId: string;
  explanation: string;
  audioUrl?: string;
  points: number;
};

export type Test = {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  isPremium: boolean;
  questionCount: number;
  sections: Section[];
};