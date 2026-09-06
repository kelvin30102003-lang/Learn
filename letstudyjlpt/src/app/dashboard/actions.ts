"use server";

import { revalidatePath } from "next/cache";
import { adminClient, getCustomUser } from "@/lib/custom-auth";
import { isJlptLevel } from "@/lib/jlpt-level";

export async function updateStudyLevel(formData: FormData) {
  const user = await getCustomUser();
  if (!user) throw new Error("You must be signed in to change your study level.");

  const level = formData.get("level");
  if (!isJlptLevel(level)) throw new Error("Choose a valid JLPT level.");

  const { error } = await adminClient().from("users").update({ target_level: level }).eq("id", user.id);
  if (error) throw new Error("Unable to save your study level.");

  revalidatePath("/dashboard");
  revalidatePath("/mock-exam");
  revalidatePath("/mock-exam/yearly");
}
