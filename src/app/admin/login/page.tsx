"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Mail, AlertCircle, ArrowRight, KeyRound } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleFillDemoAdmin = () => {
    setEmail("admin@celibrate.demo");
    setPassword("Admin@123");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error?.message || "Invalid administrator credentials");
        return;
      }

      if (json.data.user.role !== "ADMIN") {
        setError("Access Denied: This portal is restricted to Platform Administrators only.");
        return;
      }

      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("An unexpected error occurred during administrative authentication.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-pink-500 text-white shadow-lg shadow-brand-500/20 mb-4 ring-8 ring-slate-900">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            CELIBRATE <span className="text-brand-400 font-normal text-lg sm:text-xl">ADMIN</span>
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Platform Management & System Control Portal
          </p>
        </div>

        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
          {error && (
            <div className="mb-6 bg-red-950/60 border border-red-800/80 text-red-300 p-3.5 rounded-xl text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@celibrate.demo"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Master Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-brand-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? "Authenticating Admin..." : "Authenticate & Access Console"}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Demo Admin Quick Access Box */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-400 font-medium">Demo Administrator Credentials</span>
              <button
                type="button"
                onClick={handleFillDemoAdmin}
                className="text-brand-400 hover:text-brand-300 font-semibold flex items-center gap-1 hover:underline"
              >
                <KeyRound className="w-3 h-3" />
                Autofill
              </button>
            </div>
            <div className="bg-slate-950/80 border border-slate-800 p-3 rounded-xl text-xs font-mono text-slate-300 space-y-1">
              <div>Email: <span className="text-brand-300">admin@celibrate.demo</span></div>
              <div>Password: <span className="text-brand-300">Admin@123</span></div>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-slate-500 hover:text-slate-400 transition-colors">
            ← Return to Celibrate Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}
