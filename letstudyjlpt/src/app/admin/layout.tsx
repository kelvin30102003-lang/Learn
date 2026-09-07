import { redirect } from "next/navigation";
import { getCustomUser } from "@/lib/custom-auth";
import AdminShell from "@/components/AdminShell";
export default async function AdminLayout({ children }: { children: React.ReactNode }) { const user = await getCustomUser(); if (!user) redirect("/login"); if (user.role !== "admin") redirect("/dashboard"); return <AdminShell>{children}</AdminShell>; }
