"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/dashboard"), 2000);
  };

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg mb-4">
            <Zap className="h-6 w-6 text-white" />
          </div>
          {done ? (
            <>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/20 mb-2">
                <CheckCircle2 className="h-6 w-6 text-emerald-400" />
              </div>
              <h1 className="text-2xl font-bold text-white">Password updated</h1>
              <p className="mt-1 text-sm text-slate-400">Redirecting to dashboard…</p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-white tracking-tight">Set new password</h1>
              <p className="mt-1 text-sm text-slate-400">Choose a strong password for your account</p>
            </>
          )}
        </div>

        {!done && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-slate-300">New Password</Label>
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                leftIcon={<Lock className="h-3.5 w-3.5" />}
                rightIcon={
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-200">
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                }
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-400"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-slate-300">Confirm Password</Label>
              <Input
                type="password"
                placeholder="Repeat new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                leftIcon={<Lock className="h-3.5 w-3.5" />}
                className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-400"
                required
              />
            </div>
            {error && (
              <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
            )}
            <Button type="submit" variant="premium" size="lg" className="w-full" loading={loading}>
              {!loading && "Update password"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
