"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const { error: authError } = await createClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    if (authError) setError(authError.message);
    else router.push("/dashboard");
    setLoading(false);
  };

  return <div className="mx-auto max-w-md px-5 py-16 sm:py-24">
    <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--red)]">Welcome back</p><h1 className="mt-3 text-4xl font-semibold">Log in to practice.</h1><p className="mt-3 text-[var(--ink-muted)]">Keep your streak and pick up where you left off.</p></div>
    <div className="space-y-5 border border-[var(--line)] bg-white p-6">
      <GoogleSignInButton />
      <div className="flex items-center gap-3 text-xs text-[var(--ink-muted)]"><span className="h-px flex-1 bg-[var(--line)]" />OR<span className="h-px flex-1 bg-[var(--line)]" /></div>
      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-medium">Email<input name="email" required type="email" placeholder="you@example.com" className="mt-2 w-full border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--red)]" /></label>
        <label className="block text-sm font-medium">Password<input name="password" required type="password" placeholder="Your password" className="mt-2 w-full border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--red)]" /></label>
        {error && <p role="alert" className="bg-[#fff3f0] p-3 text-sm text-[var(--red-dark)]">{error}</p>}
        <button disabled={loading} className="w-full rounded-full bg-[var(--red)] px-4 py-3 font-medium text-white hover:bg-[var(--red-dark)] disabled:opacity-60">{loading ? "Logging in..." : "Log in"}</button>
        <Link href="/register" className="block text-center text-sm text-[var(--red)]">New here? Create an account →</Link>
      </form>
    </div>
    <p className="mt-5 text-center text-sm text-[var(--ink-muted)]">Forgot your password? <Link href="/reset-password" className="font-medium text-[var(--foreground)]">Reset it</Link></p>
  </div>;
}
