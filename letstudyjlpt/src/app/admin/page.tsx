import Link from "next/link";
import { adminClient, getCustomUser } from "@/lib/custom-auth";

type UserRow = { full_name: string; email: string; is_premium: boolean; created_at: string };
type AttemptRow = { status: string; started_at: string };
type Event = { time: string; initials: string; tone: string; person: string; action: string };

const dateLabel = (date: string) => {
  const minutes = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 60000));
  if (minutes < 60) return `${minutes} min ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hr ago`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(date));
};

export default async function AdminPage() {
  const admin = await getCustomUser();
  const client = adminClient();
  const [users, premium, questions, tests, attemptsResult, recentUsers, recentQuestions, recentTests, recentPayments] = await Promise.all([
    client.from("users").select("id", { count: "exact", head: true }),
    client.from("users").select("id", { count: "exact", head: true }).eq("is_premium", true),
    client.from("questions").select("id", { count: "exact", head: true }),
    client.from("tests").select("id", { count: "exact", head: true }),
    client.from("attempts").select("status, started_at").order("started_at", { ascending: false }).limit(500),
    client.from("users").select("full_name, email, is_premium, created_at").order("created_at", { ascending: false }).limit(4),
    client.from("questions").select("id, question_text, created_at").order("created_at", { ascending: false }).limit(3),
    client.from("tests").select("title, created_at").order("created_at", { ascending: false }).limit(3),
    client.from("payments").select("id, status, created_at").order("created_at", { ascending: false }).limit(3),
  ]);
  const attempts = (attemptsResult.data ?? []) as AttemptRow[];
  const monthKeys = Array.from({ length: 12 }, (_, index) => { const d = new Date(); d.setMonth(d.getMonth() - (11 - index)); return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleString("en", { month: "short" }) }; });
  const monthly = monthKeys.map(({ key, label }) => { const rows = attempts.filter((attempt) => { const d = new Date(attempt.started_at); return `${d.getFullYear()}-${d.getMonth()}` === key; }); return { label, attempts: rows.length, completed: rows.filter((row) => row.status === "completed").length }; });
  const maxMonthly = Math.max(1, ...monthly.flatMap((month) => [month.attempts, month.completed]));
  const events: Event[] = [
    ...((recentUsers.data ?? []) as UserRow[]).map((user) => ({ time: user.created_at, initials: (user.full_name || user.email).slice(0, 2).toUpperCase(), tone: "blue", person: user.full_name || user.email, action: user.is_premium ? "joined with Premium access" : "registered as a new learner" })),
    ...(recentQuestions.data ?? []).map((question) => ({ time: question.created_at, initials: "Q", tone: "purple", person: "Question bank", action: `added ${question.question_text ? `“${question.question_text.slice(0, 34)}…”` : `question #${question.id}`}` })),
    ...(recentTests.data ?? []).map((test) => ({ time: test.created_at, initials: "EX", tone: "gold", person: "Mock exams", action: `created “${test.title}”` })),
    ...(recentPayments.data ?? []).map((payment) => ({ time: payment.created_at, initials: "P", tone: "green", person: "Payments", action: `${payment.status} payment #${payment.id}` })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 4);
  const totalUsers = users.count ?? 0; const premiumUsers = premium.count ?? 0;
  const stats = [[String(totalUsers), "Total users", "All registered learners", "◉", "blue"], [String(attempts.length), "Test attempts", "Recent attempts tracked", "◌", "purple"], [String(premiumUsers), "Premium users", "Active premium access", "✦", "gold"], [String(questions.count ?? 0), "Total questions", `${tests.count ?? 0} mock exams available`, "▤", "green"]];
  const conversion = (premiumUsers / Math.max(1, totalUsers)) * 100;
  const firstName = admin?.full_name?.split(" ")[0] || "Admin";

  return <div className="admin-page"><div className="page-heading"><div><p className="eyebrow">Platform overview</p><h1>Good morning, {firstName} <span>✦</span></h1><p>Live platform activity and learning performance at a glance.</p></div><div className="heading-actions"><span className="live-indicator"><i />Live data</span><Link className="primary-btn" href="/admin/questions?new=1">＋ Add question</Link></div></div><section className="metric-grid">{stats.map(([value, label, note, icon, tone]) => <div className="metric-card" key={label}><div className={`metric-icon ${tone}`}>{icon}</div><div className="metric-copy"><p>{label}</p><strong>{value}</strong><small>{note}</small></div></div>)}</section><section className="dashboard-grid"><div className="panel performance"><div className="panel-heading"><div><h2>Platform performance</h2><p>Real test attempts over the past 12 months</p></div></div><div className="chart-legend"><span><i className="attempts" />Test attempts</span><span><i className="completed" />Completed</span></div><div className="chart"><div className="y-axis"><span>{maxMonthly}</span><span>{Math.ceil(maxMonthly * .75)}</span><span>{Math.ceil(maxMonthly * .5)}</span><span>{Math.ceil(maxMonthly * .25)}</span><span>0</span></div><div className="bars">{monthly.map((month, index) => <div className="bar-set" key={`${month.label}-${index}`}><i title={`${month.attempts} attempts`} style={{ height: `${month.attempts / maxMonthly * 100}%` }} /><b title={`${month.completed} completed`} style={{ height: `${month.completed / maxMonthly * 100}%` }} /></div>)}</div></div><div className="months">{monthly.map((month, index) => <span key={`${month.label}-${index}`}>{month.label}</span>)}</div></div><div className="panel funnel"><div className="panel-heading"><div><h2>Premium conversion</h2><p>Based on registered learners</p></div></div><div className="donut" style={{ background: `conic-gradient(#5168ee 0 ${conversion}%, #dfe5ed ${conversion}% 100%)` }}><div><b>{conversion.toFixed(1)}%</b><span>conversion</span></div></div><div className="funnel-summary"><span>Free users <b>{Math.max(0, totalUsers - premiumUsers)}</b></span><span>Premium users <b>{premiumUsers}</b></span></div></div><div className="panel activity"><div className="panel-heading"><div><h2>Recent activity</h2><p>Latest events from your platform</p></div></div>{events.length ? events.map((event) => <div className="activity-row" key={`${event.time}-${event.action}`}><span className={`activity-avatar ${event.tone}`}>{event.initials}</span><p><b>{event.person}</b> {event.action}<small>{dateLabel(event.time)}</small></p></div>) : <p className="empty-state">New registrations, content, and payments will appear here.</p>}</div><div className="panel quick"><div className="panel-heading"><div><h2>Quick actions</h2><p>Frequently used admin tools</p></div></div><div className="quick-grid"><Link href="/admin/questions?new=1"><i>＋</i><span>Add question</span><small>Create content</small></Link><Link href="/admin/tests?new=1"><i>▣</i><span>Create mock exam</span><small>Build a new test</small></Link><Link href="/admin/users"><i>◉</i><span>Manage users</span><small>View all learners</small></Link><Link href="/admin/payments"><i>✦</i><span>Premium access</span><small>Review payments</small></Link></div></div></section></div>;
}
