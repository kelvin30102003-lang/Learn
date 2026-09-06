"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navigation = [
  ["Dashboard", "/dashboard", "▦"],
  ["Mock Exams", "/mock-exam", "▣"],
  ["Practice Tests", "/tests", "◩"],
  ["Exam History", "/dashboard", "◷"],
  ["Results & Analytics", "/dashboard", "⌁"],
  ["Settings", "/dashboard/settings", "⚙"],
];

function isActive(pathname: string, label: string, href: string) {
  if (label === "Mock Exams") return pathname.startsWith("/mock-exam");
  if (label === "Dashboard") return pathname === "/dashboard";
  if (label === "Practice Tests") return pathname === "/tests";
  if (label === "Settings") return pathname.startsWith("/dashboard/settings");
  if (label === "Exam History" || label === "Results & Analytics") return false;
  return pathname === href.split("#")[0] && !href.includes("#");
}

export default function DashboardSidebar() {
  const pathname = usePathname();

  return <aside className="portal-sidebar flex flex-col border-b border-[var(--line)] bg-white px-5 py-5 lg:fixed lg:inset-y-0 lg:left-0 lg:z-30 lg:w-[260px] lg:overflow-y-auto lg:border-b-0 lg:border-r">
    <Link href="/dashboard" prefetch className="flex items-start gap-3 border-b border-slate-100 px-2 pb-6"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#ed3340] text-xl font-bold text-white">王</span><span className="leading-none"><strong className="block text-[19px] tracking-tight text-slate-900">JLPT SIMULATOR</strong><span className="mt-2 inline-block rounded bg-[#ed3340] px-2 py-1 text-[10px] font-bold tracking-[0.14em] text-white">MOCK LAB</span><span className="ml-1 text-[10px] font-bold tracking-[0.14em] text-slate-400">v2.4.0</span></span></Link>
    <nav className="mt-5 space-y-1">{navigation.map(([label, href, icon]) => { const active = isActive(pathname, label, href); return <Link key={label} href={href} prefetch className={`flex items-center gap-4 rounded-xl px-4 py-3 text-[15px] font-semibold transition ${active ? "border border-red-200 bg-red-50 text-[#df2935]" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}><span className={`grid size-5 place-items-center text-xl leading-none ${active ? "text-[#df2935]" : "text-slate-500"}`}>{icon}</span><span>{label}</span></Link>; })}</nav>
    <div className="mt-auto border-t border-slate-100 pt-5"><Link href="/mock-exam" prefetch className="flex items-center justify-center gap-2 rounded-xl bg-[#e9252d] px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#c91c25]"><span className="text-lg">▷</span> Quick Mock Exam</Link></div>
  </aside>;
}
