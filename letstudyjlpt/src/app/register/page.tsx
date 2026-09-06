"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fullName: String(form.get("full_name")).trim(), email: String(form.get("email")).trim(), password: String(form.get("password")) }) });
      const result = await response.json();
      if (!response.ok) setError(result.error ?? "Unable to create account.");
      else router.push("/dashboard");
    } catch {
      setError("Unable to connect to the registration service. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return <div className="mx-auto max-w-md px-5 py-16 sm:py-24">
    <div className="mb-8"><p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--red)]">Start your practice</p><h1 className="mt-3 text-4xl font-semibold">Make N5 yours.</h1><p className="mt-3 text-[var(--ink-muted)]">Create an account to keep your results and progress together.</p></div>
    <div className="space-y-5 border border-[var(--line)] bg-white p-6">
      <form onSubmit={submit} className="space-y-5">
        <label className="block text-sm font-medium">Your name<input name="full_name" required placeholder="e.g. John" className="mt-2 w-full border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--red)]" /></label>
        <label className="block text-sm font-medium">Email<input name="email" required type="email" placeholder="you@example.com" className="mt-2 w-full border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--red)]" /></label>
        <label className="block text-sm font-medium">Password<input name="password" required minLength={8} type="password" placeholder="At least 8 characters" className="mt-2 w-full border border-[var(--line)] px-3 py-3 outline-none focus:border-[var(--red)]" /></label>
        {error && <p role="alert" className="bg-[#fff3f0] p-3 text-sm text-[var(--red-dark)]">{error}</p>}
        {message && <p className="bg-[var(--mint)] p-3 text-sm text-[#317052]">{message}</p>}
        <button disabled={loading} className="w-full rounded-full bg-[var(--foreground)] px-4 py-3 font-medium text-white hover:bg-[var(--red-dark)] disabled:opacity-60">{loading ? "Creating account..." : "Create free account"}</button>
        <Link href="/login" className="block text-center text-sm text-[var(--red)]">Already have an account? Log in →</Link>
      </form>
    </div>
  </div>;
}
