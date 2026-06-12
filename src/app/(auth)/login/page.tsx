"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Zap, ArrowRight, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "admin@nexus.com", password: "password123" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1200));
    router.push("/dashboard");
  };

  return (
    <div>
      {/* Card */}
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg mb-4">
            <Zap className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-400">Sign in to your Nexus dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label className="text-slate-300">Email address</Label>
            <Input
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              leftIcon={<Mail className="h-3.5 w-3.5" />}
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-400"
              required
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-slate-300">Password</Label>
              <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              leftIcon={<Lock className="h-3.5 w-3.5" />}
              rightIcon={
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-400 hover:text-slate-200 transition-colors">
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              }
              className="bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-indigo-400"
              required
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="remember"
              className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 accent-indigo-500"
            />
            <label htmlFor="remember" className="text-xs text-slate-400 cursor-pointer">
              Remember me for 30 days
            </label>
          </div>

          <Button
            type="submit"
            variant="premium"
            size="lg"
            className="w-full mt-2"
            loading={loading}
          >
            {!loading && "Sign in to dashboard"}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </Button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-slate-500">or continue with</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* SSO buttons */}
        <div className="grid grid-cols-2 gap-3">
          {["Google", "Microsoft"].map((provider) => (
            <button
              key={provider}
              className="flex items-center justify-center gap-2 h-9 rounded-lg border border-white/10 bg-white/5 text-sm text-slate-300 hover:bg-white/10 transition-colors"
            >
              <span className="text-xs font-medium">{provider}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Demo hint */}
      <div className="mt-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-3 text-center">
        <p className="text-xs text-indigo-300">
          <span className="font-semibold">Demo:</span> Use pre-filled credentials to explore the dashboard
        </p>
      </div>

      <p className="mt-6 text-center text-xs text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="#" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
          Contact your administrator
        </Link>
      </p>
    </div>
  );
}
