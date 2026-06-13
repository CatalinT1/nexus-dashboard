"use client";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Send, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback?next=/reset-password`
        : "/auth/callback?next=/reset-password";
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setSent(true);
  };

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg mb-4">
            <Zap className="h-6 w-6 text-white" />
          </div>
          {!sent ? (
            <>
              <h1 className="text-2xl font-bold text-white tracking-tight">Reset password</h1>
              <p className="mt-1 text-sm text-slate-400 text-center">
                Enter your email and we&apos;ll send a reset link
              </p>
            </>
          ) : (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 mb-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Check your email</h1>
              <p className="mt-1 text-sm text-slate-400 text-center">
                We sent a reset link to <span className="text-white font-medium">{email}</span>
              </p>
            </>
          )}
        </div>

        {!sent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300">Email address</Label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="h-3.5 w-3.5" />}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-400"
                required
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button
              type="submit"
              variant="premium"
              size="lg"
              className="w-full"
              loading={loading}
            >
              {!loading && <><Send className="h-4 w-4" /> Send reset link</>}
            </Button>
          </form>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-400 text-center">
              Didn&apos;t receive the email? Check your spam folder or{" "}
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                try again
              </button>
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-slate-500">or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>
            <Link
              href="/login"
              className="flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition-colors"
            >
              Back to sign in
            </Link>
          </div>
        )}
      </div>

      <Link
        href="/login"
        className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to sign in
      </Link>
    </div>
  );
}
