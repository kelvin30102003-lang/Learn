"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";

export default function GoogleSignInButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInWithGoogle = async () => {
    setLoading(true);
    setError("");
    const { error: authError } = await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (authError) {
      setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <div>
      <button type="button" onClick={signInWithGoogle} disabled={loading} className="flex w-full items-center justify-center gap-3 rounded-full border border-[var(--line)] bg-white px-4 py-3 font-medium transition hover:border-[var(--foreground)] disabled:opacity-60">
        <span className="text-lg font-semibold">G</span>
        {loading ? "Opening Google..." : "Continue with Google"}
      </button>
      {error && <p role="alert" className="mt-3 bg-[#fff3f0] p-3 text-sm text-[var(--red-dark)]">{error}</p>}
    </div>
  );
}