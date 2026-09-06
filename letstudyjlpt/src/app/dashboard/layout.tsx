import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/DashboardSidebar";
import { getCustomUser } from "@/lib/custom-auth";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCustomUser();
  if (!user) redirect("/login");
  const name = user.full_name || user.email.split("@")[0] || "Learner";

  return <div className="portal-shell min-h-screen bg-[#f8fafc]"><DashboardSidebar /><header className="portal-header border-b border-[var(--line)] bg-white"><div className="flex h-16 items-center justify-end px-5 lg:px-8"><div className="flex items-center gap-4"><button type="button" aria-label="Notifications" className="relative grid size-9 place-items-center text-[var(--ink-muted)] transition hover:text-[var(--foreground)]"><svg aria-hidden="true" className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M15 17H9m9-2V10a6 6 0 0 0-12 0v5l-2 2h16l-2-2Zm-5 5h-2" /></svg><span className="absolute right-1 top-1 size-2 rounded-full bg-[var(--red)]" /></button><span aria-hidden="true" className="h-8 w-px bg-[var(--line)]" /><span className="flex min-w-[112px] flex-col leading-tight"><span className="text-sm font-semibold text-[var(--foreground)]">{name}</span><span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink-muted)]">N3 Candidate</span></span></div></div></header><main className="portal-main min-w-0 px-5 py-8 lg:px-10 lg:py-10">{children}</main></div>;
}
