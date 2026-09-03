import { notFound } from "next/navigation";
import SimulationClient from "@/components/SimulationClient";
import { getQuestions, getTest } from "@/data/mock";
export default async function SimulationPage({ params }: { params: Promise<{ testId: string }> }) { const { testId } = await params; const test = getTest(testId); if (!test) notFound(); return <SimulationClient questions={getQuestions(testId).slice(0, test.questionCount)}/>; }