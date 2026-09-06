import Link from "next/link";

export default function Navbar() {
  return <header className="border-b border-[var(--line)] bg-[var(--background)]/95 backdrop-blur">
    <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
      <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight"><span className="grid size-8 place-items-center rounded-full bg-[var(--red)] text-sm text-white">N5</span><span>kotoba<span className="text-[var(--red)]">.lab</span></span></Link>
      <nav className="hidden items-center gap-6 text-sm text-[var(--ink-muted)] md:flex"><Link href="/" className="hover:text-[var(--foreground)]">Home</Link><Link href="/about" className="hover:text-[var(--foreground)]">About</Link><Link href="/contact" className="hover:text-[var(--foreground)]">Contact</Link></nav>
      <div className="flex items-center gap-2 text-sm"><Link href="/login" className="hidden px-3 py-2 text-[var(--ink-muted)] sm:block">Log in</Link><Link href="/register" className="rounded-full bg-[var(--foreground)] px-4 py-2 font-medium text-white transition hover:bg-[var(--red-dark)]">Start free</Link></div>
    </div>
  </header>;
}