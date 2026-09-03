import { Question, Test } from "@/types/question";

const choices = (items: string[]) => items.map((text, index) => ({ id: `${index + 1}`, key: String.fromCharCode(65 + index), text }));

export const tests: Test[] = [
  { id: "free-n5", title: "N5 Starter Check", description: "A short confidence-building set across the four N5 sections.", durationMinutes: 20, isPremium: false, questionCount: 8, sections: ["Vocabulary", "Grammar", "Reading", "Listening"] },
  { id: "mock-01", title: "Full Simulation 01", description: "A complete original practice paper with exam-style pacing.", durationMinutes: 60, isPremium: true, questionCount: 15, sections: ["Vocabulary", "Grammar", "Reading", "Listening"] },
  { id: "grammar-01", title: "Grammar Focus", description: "Build speed with the particles and patterns that matter at N5.", durationMinutes: 25, isPremium: true, questionCount: 5, sections: ["Grammar"] },
];

export const questions: Question[] = [
  { id: "q1", section: "Vocabulary", questionNumber: 1, questionText: "わたしは毎朝 ______ を飲みます。", questionType: "multiple_choice", choices: choices(["水", "本", "車", "学校"]), correctChoiceId: "1", explanation: "水（みず）means water, a natural drink in this sentence.", points: 1 },
  { id: "q2", section: "Vocabulary", questionNumber: 2, questionText: "「大きい」の反対は何ですか。", questionType: "multiple_choice", choices: choices(["小さい", "新しい", "長い", "高い"]), correctChoiceId: "1", explanation: "小さい（ちいさい）means small, the opposite of 大きい.", points: 1 },
  { id: "q3", section: "Grammar", questionNumber: 3, questionText: "これは だれ ______ かばんですか。", questionType: "multiple_choice", choices: choices(["の", "を", "に", "で"]), correctChoiceId: "1", explanation: "The particle の connects a person and something they possess.", points: 1 },
  { id: "q4", section: "Grammar", questionNumber: 4, questionText: "日曜日 ______ 映画を見ました。", questionType: "multiple_choice", choices: choices(["に", "を", "が", "へ"]), correctChoiceId: "1", explanation: "に marks a specific time, such as 日曜日 (Sunday).", points: 1 },
  { id: "q5", section: "Reading", questionNumber: 5, questionText: "【図書館のお知らせ】月曜日は休みです。火曜日から土曜日まで、朝9時から午後5時までです。図書館はいつ休みですか。", questionType: "reading", choices: choices(["月曜日", "火曜日", "日曜日", "土曜日" ]), correctChoiceId: "1", explanation: "The notice says 月曜日は休みです: the library is closed on Monday.", points: 1 },
  { id: "q6", section: "Reading", questionNumber: 6, questionText: "田中さんは毎朝7時に起きて、コーヒーを飲みます。田中さんは何を飲みますか。", questionType: "reading", choices: choices(["お茶", "水", "コーヒー", "牛乳"]), correctChoiceId: "3", explanation: "The passage directly says コーヒーを飲みます.", points: 1 },
  { id: "q7", section: "Listening", questionNumber: 7, questionText: "音声を聞いて、正しい答えを選んでください。", questionType: "listening", choices: choices(["駅", "病院", "学校", "会社"]), correctChoiceId: "1", explanation: "In this practice placeholder, the speaker is asking for the station.", points: 1 },
  { id: "q8", section: "Listening", questionNumber: 8, questionText: "音声を聞いて、女性が買うものを選んでください。", questionType: "listening", choices: choices(["りんご", "パン", "たまご", "さかな"]), correctChoiceId: "2", explanation: "In this practice placeholder, the woman buys bread.", points: 1 },
];

export const getTest = (id: string) => tests.find((test) => test.id === id);
export const getQuestions = (testId: string) => testId === "free-n5" ? questions : questions.concat(questions.slice(0, 7));