"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const groups = [
  { label: "Workspace", items: [["Overview", "/admin", "⌂"]] },
  { label: "User management", items: [["All users", "/admin/users", "◉"], ["Premium users", "/admin/payments", "✦"]] },
  { label: "Question bank", items: [["All questions", "/admin/questions", "▤"], ["Add question", "/admin/questions?new=1", "+"], ["Categories", "/admin/questions?view=categories", "◇"]] },
  { label: "Mock exams", items: [["All exams", "/admin/tests", "▣"], ["Create exam", "/admin/tests?new=1", "+"]] },
  { label: "Results & analytics", items: [["Exam results", "/admin/tests?view=results", "◫"], ["Analytics", "/admin?view=analytics", "↗"]] },
  { label: "System", items: [["Activity logs", "/admin?view=activity", "◌"], ["Settings", "/dashboard/settings", "⚙"]] },
] as const;

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [compact, setCompact] = useState(false);
  const [toast, setToast] = useState(false);
  return <div className={`admin-shell ${compact ? "is-compact" : ""}`}>
    <aside className="admin-sidebar">
      <div className="admin-brand"><span className="brand-mark">学</span><span className="brand-name">letstudy<span>JLPT</span></span><button onClick={() => setCompact(!compact)} className="collapse" aria-label="Toggle sidebar">☰</button></div>
      <nav>{groups.map(group => <div className="nav-group" key={group.label}><p>{group.label}</p>{group.items.map(([label, href, icon]) => <Link key={label} href={href} className={pathname === href.split("?")[0] && (href === "/admin" ? pathname === "/admin" : true) ? "active" : ""} title={label}><i>{icon}</i><span>{label}</span></Link>)}</div>)}</nav>
      <div className="admin-help"><span>?</span><div><b>Need a hand?</b><small>Visit the help centre</small></div></div>
    </aside>
    <main className="admin-main">
      <header className="admin-topbar"><div className="breadcrumbs"><span>Admin</span><b> / </b><strong>{pathname === "/admin" ? "Overview" : pathname.split("/").pop()}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Search">⌕</button><button onClick={() => { setToast(true); setTimeout(() => setToast(false), 2600); }} className="notification" aria-label="Notifications">♢<em>3</em></button><div className="admin-avatar">AD</div><div className="admin-identity"><b>Administrator</b><small>Super admin</small></div><span className="chevron">⌄</span></div></header>
      <div className="admin-content">{children}</div>
    </main>
    {toast && <div className="admin-toast"><b>Notifications</b><span>3 new submissions need your review.</span></div>}
  </div>;
}
